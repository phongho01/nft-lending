import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OrdersController } from './offers.controller';
import { ConnectionsModule } from 'src/connections/connections.module';
import { ReposityModule } from './reposities/reposity.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ConnectionsModule, ReposityModule, IpfsModule, OrdersModule],
  exports: [OffersService],
  controllers: [OrdersController],
  providers: [OffersService],
})
export class OffersModule {}
