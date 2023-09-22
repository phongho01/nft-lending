import { LendingPoolModule } from './../lending-pool/lending-pool.module';
import { NftsModule } from './../nfts/nfts.module';
import { Module } from '@nestjs/common';
import { ConnectionsModule } from 'src/connections/connections.module';
import { ReposityModule } from './reposities/reposity.module';
import { OffersModule } from '../offers/offers.module';
import { CrawlsSchedule } from './crawls.schedule';

@Module({
  imports: [
    ConnectionsModule,
    ReposityModule,
    OffersModule,
    NftsModule,
    LendingPoolModule,
  ],
  controllers: [],
  providers: [CrawlsSchedule],
})
export class SchedulesModule {}
