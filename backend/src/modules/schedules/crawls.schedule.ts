import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JsonRpcProvider } from 'ethers';
import { OffersService } from '../offers/offers.service';
import { NftsService } from '../nfts/nfts.service';
import { LendingPoolService } from '../lending-pool/lending-pool.service';
import { Crawl } from './reposities/crawl.reposity';
import config from 'src/config';

@Injectable()
export class CrawlsSchedule implements OnModuleInit {
  private rpcProvider: JsonRpcProvider;

  constructor(
    private offersService: OffersService,
    private nftsService: NftsService,
    private lendingPoolService: LendingPoolService,
    private readonly crawl: Crawl,
  ) {}

  onModuleInit() {
    this.rpcProvider = new JsonRpcProvider(config.ENV.NETWORK_RPC_URL);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleEvents() {
    const onChainLatestBlock = await this.rpcProvider.getBlockNumber();
    if (!onChainLatestBlock) {
      return;
    }

    let crawlLatestBlock = await this.crawl.getCrawlLatestBlock();
    if (!crawlLatestBlock || crawlLatestBlock === 0) {
      crawlLatestBlock = onChainLatestBlock - 1;
      await this.crawl.setCrawlLatestBlock(crawlLatestBlock);
    }

    let toBlock;
    if (onChainLatestBlock - 1 <= crawlLatestBlock) {
      toBlock = crawlLatestBlock;
    } else {
      toBlock = onChainLatestBlock - 1;
    }

    // Avoid error exceed maximum block range
    if (toBlock - crawlLatestBlock > 5000) {
      toBlock = crawlLatestBlock + 5000;
    }

    await this.nftsService.handleEvents(
      this.rpcProvider,
      crawlLatestBlock,
      toBlock,
    );

    await this.offersService.handleEvents(
      this.rpcProvider,
      crawlLatestBlock,
      toBlock,
    );

    // await this.offersService.handleExpiredOffer();

    await this.crawl.setCrawlLatestBlock(toBlock);
  }
}
