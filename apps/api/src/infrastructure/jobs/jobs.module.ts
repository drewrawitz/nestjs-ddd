import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import Redis from 'ioredis';
import { RedisModule } from '../store/redis.module';
import { REDIS_CLIENT_TOKEN } from '../store/store.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redisClient: Redis) => ({
        connection: redisClient,
      }),
      inject: [REDIS_CLIENT_TOKEN],
    }),
    BullBoardModule.forRoot({
      route: '/jobs',
      adapter: ExpressAdapter,
    }),
  ],
})
export class JobsModule {}
