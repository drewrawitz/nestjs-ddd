import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { STRIPE_QUEUE } from './jobs.types';
import { JOBS_TOKEN } from './jobs.token';
import { BullJobService } from './bullMq.job.service';
import Redis from 'ioredis';
import { RedisModule } from '../store/redis.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redisClient: Redis) => ({
        connection: redisClient,
      }),
      inject: ['REDIS_CLIENT'],
    }),
    BullModule.registerQueue({
      name: STRIPE_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: STRIPE_QUEUE,
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
