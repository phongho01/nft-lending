import { Module } from '@nestjs/common';
import { IpfsService } from './ipfs.service';

@Module({
  imports: [],
  exports: [IpfsService],
  providers: [IpfsService],
})
export class IpfsModule {}
