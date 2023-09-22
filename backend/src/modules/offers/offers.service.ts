import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { Contract, JsonRpcProvider, ethers } from 'ethers';
import config from 'src/config';
import { verifySignature, generateOfferMessage } from '../utils/signature';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferStatus } from './dto/offer.enum';
import { OrderStatus } from '../orders/dto/order.enum';
import { Offer } from './reposities/offer.reposity';
import { Order } from '../orders/reposities/order.reposity';
import { DacsService } from '../dacs/dacs.service';
import * as FACTORY_ABI from './abi/LOAN.json';

@Injectable()
export class OffersService implements OnModuleInit {
  private rpcProvider: JsonRpcProvider;
  private nftContract: Contract;

  constructor(
    private readonly offer: Offer,
    private readonly order: Order,
    private readonly dacs: DacsService,
  ) {}

  onModuleInit() {
    this.rpcProvider = new JsonRpcProvider(config.ENV.NETWORK_RPC_URL);
    this.nftContract = new Contract(
      config.ENV.COLLECTION_ADDRESS,
      FACTORY_ABI,
      this.rpcProvider,
    );
  }

  async create(createOfferDto: CreateOfferDto) {
    const offerHash = generateOfferMessage(
      createOfferDto,
      createOfferDto.signature,
      config.ENV.LOAN_ADDRESS,
      config.ENV.CHAIN_ID,
    );

    if (
      !verifySignature(
        createOfferDto.creator,
        ethers.getBytes(offerHash),
        createOfferDto.signature.signature,
      )
    ) {
      throw new UnauthorizedException();
    }

    const newOffer: Record<string, any> = {
      ...createOfferDto,
      floorPrice: (createOfferDto.offer * 1.1).toFixed(2),
      hash: offerHash,
      status: OfferStatus.OPENING,
      // createdAt: new Date().getTime(),
    };

    const dacs_cid = await this.dacs.upload(newOffer);
    newOffer.dacs_url = `${config.ENV.SERVER_HOST}:${config.ENV.SERVER_PORT}/dacs/${dacs_cid}`;

    await this.offer.create(createOfferDto.order, offerHash, newOffer);
  }

  async findAll(conditions: Record<string, any> = {}) {
    return await this.offer.find(conditions);
  }

  async findById(id: string) {
    return await this.offer.getByKey(id);
  }

  async findByCreator(creator: string) {
    return await this.offer.find({ creator });
  }

  async findByOrder(order: string) {
    return await this.offer.find({ order });
  }

  async handleEvents(rpcProvider: JsonRpcProvider, from: number, to: number) {
    try {
      const loanContract = new Contract(
        config.ENV.LOAN_ADDRESS,
        FACTORY_ABI,
        rpcProvider,
      );

      // Fetch events data
      const events = await loanContract.queryFilter('*', from, to);

      for (let i = 0; i < events.length; i++) {
        const event: any = events[i];
        if (!event) continue;
        if (Object.keys(event).length === 0) continue;
        if (!event.fragment) continue;

        console.log(event.fragment.name, event.args.loanId);

        switch (event.fragment.name) {
          case 'LoanStarted': {
            const loanId = event.args.loanId;
            const offer = await this.findById(loanId);
            if (offer) {
              await Promise.all([
                this.offer.update(loanId, { status: OfferStatus.FILLED }),
                this.offer.deleteAllAccept(loanId),
                this.order.update(offer.order, { status: OrderStatus.FILLED }),
              ]);
            } else {
              await this.order.update(loanId, { status: OrderStatus.FILLED });
            }

            break;
          }
          case 'LoanRepaid': {
            const loanId = event.args.loanId;
            const offer = await this.findById(loanId);
            if (offer) {
              await Promise.all([
                this.offer.update(loanId, { status: OfferStatus.REPAID }),
                this.order.update(offer.order, { status: OrderStatus.REPAID }),
              ]);
            } else {
              await this.order.update(loanId, { status: OrderStatus.REPAID });
            }

            break;
          }
          case 'LoanLiquidated': {
            const loanId = event.args.loanId;
            const offer = await this.findById(loanId);
            if (offer) {
              await Promise.all([
                this.offer.update(loanId, { status: OfferStatus.LIQUIDATED }),
                this.order.update(offer.order, {
                  status: OrderStatus.LIQUIDATED,
                }),
              ]);
            } else {
              await this.order.update(loanId, { status: OrderStatus.REPAID });
            }

            break;
          }
          default: {
            break;
          }
        }
      }
    } catch (error) {
      console.log('offer', error);
      if (error.response?.data) {
        throw new HttpException(error.response.data, error.response.status);
      } else {
        throw new HttpException(error.body, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async handleExpiredOffer() {
    try {
      this.offer.updateExpiredOffer();
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(error.response.data, error.response.status);
      } else {
        throw new HttpException(error.body, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
