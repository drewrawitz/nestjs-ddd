import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { STRIPE_QUEUE, EMAIL_QUEUE } from './jobs.types';
import { JOBS_TOKEN } from './jobs.token';
import { BullJobService } from './bullMq.job.service';
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
    BullModule.registerQueue({
      name: STRIPE_QUEUE,
    }),
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: STRIPE_QUEUE,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: EMAIL_QUEUE,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forRoot({
      route: '/jobs',
      adapter: ExpressAdapter,
    }),
  ],
  providers: [
    {
      provide: JOBS_TOKEN,
      useClass: BullJobService,
    },
  ],
  exports: [JOBS_TOKEN],
})
export class JobsModule {}
