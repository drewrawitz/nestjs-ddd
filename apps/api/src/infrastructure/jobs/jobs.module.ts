import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { EnvService } from '../env/env.service';
import { STRIPE_QUEUE } from './jobs.types';
import { JOBS_TOKEN } from './jobs.token';
import { BullJobService } from './bullMq.job.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (envService: EnvService) => {
        return {
          connection: {
            host: envService.get('REDIS_HOST'),
            port: envService.get('REDIS_PORT'),
          },
        };
      },
      inject: [EnvService],
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
      adapter: FastifyAdapter,
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
