import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrderRedisService } from './redis/order.redis.provider';
import { VoteRedisService } from './redis/vote.redis.provider';

@Module({
  imports: [
    EventEmitterModule.forRoot()
  ],
  providers: [
    VoteRedisService,
    OrderRedisService
  ],
  exports: [
    VoteRedisService,
    OrderRedisService,
    EventEmitterModule
  ],
})
export class ConnectionsModule {}
