import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
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
