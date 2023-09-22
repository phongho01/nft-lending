import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ConnectionsModule } from 'src/connections/connections.module';
import { ReposityModule } from './reposities/reposity.module';
import { NftsModule } from '../nfts/nfts.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { LendingPoolModule } from '../lending-pool/lending-pool.module';

@Module({
  imports: [
    ConnectionsModule,
    ReposityModule,
    NftsModule,
    IpfsModule,
    LendingPoolModule,
  ],
  exports: [ReposityModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
