import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnvService } from '../env/env.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [EnvService],
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
  ],
})
export class JobsModule {}
