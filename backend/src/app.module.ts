import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConnectionsModule } from './connections/connections.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OffersModule } from './modules/offers/offers.module';
import { NftsModule } from './modules/nfts/nfts.module';
import { VotesModule } from './modules/votes/votes.module';
import { DacsModule } from './modules/dacs/dacs.module';
import { LendingPoolModule } from './modules/lending-pool/lending-pool.module';
import { SchedulesModule } from './modules/schedules/schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConnectionsModule,
    OrdersModule,
    OffersModule,
    NftsModule,
    VotesModule,
    DacsModule,
    LendingPoolModule,
    SchedulesModule,
  ],
  providers: [ConnectionsModule],
})
export class AppModule {}
