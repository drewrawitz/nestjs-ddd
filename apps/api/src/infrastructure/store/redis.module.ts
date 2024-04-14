import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { EnvService } from '../env/env.service';
import { STORE_TOKEN } from './store.constants';
import { RedisStoreService } from './redis.store';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (envService: EnvService) => {
        const client = new Redis({
          host: envService.get('REDIS_HOST'),
          port: envService.get('REDIS_PORT'),
          maxRetriesPerRequest: null,
        });
        return client;
      },
      inject: [EnvService],
    },
    {
      provide: STORE_TOKEN,
      useClass: RedisStoreService,
    },
  ],
  exports: ['REDIS_CLIENT', STORE_TOKEN],
})
export class RedisModule {}
