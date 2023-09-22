import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Contract, JsonRpcProvider } from 'ethers';
import axios from 'axios';
import { Nft } from './reposities/nft.reposity';
import config from 'src/config';
import * as FACTORY_ABI from './abi/ERC721.json';
import { SyncNftDto } from './dto/sync-nft.dto';

@Injectable()
export class NftsService {
  constructor(private readonly nft: Nft) {}

  async getNfts(address: string) {
    try {
      return {};
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async handleEvents(rpcProvider: JsonRpcProvider, from: number, to: number) {
    try {
      const nftContract = new Contract(
        config.ENV.COLLECTION_ADDRESS,
        FACTORY_ABI,
        rpcProvider,
      );
      // Fetch events data
      const events = await nftContract.queryFilter('Transfer', from, to);

      // Retrieve all event informations
      if (!events || events.length === 0) return;
      for (let i = 0; i < events.length; i++) {
        const event: any = events[i];
        if (!event) continue;
        if (Object.keys(event).length === 0) continue;

        const tokenId = Number(BigInt(event.args.tokenId).toString());

        const { data } = await axios.get(await nftContract.tokenURI(tokenId));

        const nftData = {
          owner: event.args.to.toLowerCase(),
          tokenId: tokenId,
          tokenURI: await nftContract.tokenURI(tokenId),
          collectionName: await nftContract.name(),
          collectionSymbol: await nftContract.symbol(),
          collectionAddress: event.address.toLowerCase(),
          metadata: data,
          isAvailable: true,
        };

        // const existedNft = await this.findAll({
        //   tokenId: tokenId.toString(),
        //   collectionAddress: event.address.toLowerCase(),
        // });

        // if (existedNft.length > 0) {
        //   nftData = {
        //     ...existedNft[0],
        //     isAvailable: true,
        //     owner: event.args.to.toLowerCase(),
        //   };
        // }

        await this.syncNft(nftData);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data) {
        throw new HttpException(error.response.data, error.response.status);
      } else {
        throw new HttpException(error.body, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async syncNft(nftInfo: SyncNftDto) {
    try {
      await this.nft.sync(nftInfo);
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async findAll(conditions: Record<string, any> = {}) {
    return await this.nft.find(conditions);
  }
}
