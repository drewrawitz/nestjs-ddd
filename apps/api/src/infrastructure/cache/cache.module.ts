import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { EnvService } from '../env/env.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (envService: EnvService) => ({
        isGlobal: true,
        store: redisStore,
        host: envService.get('REDIS_HOST'),
        port: envService.get('REDIS_PORT'),
      }),
      inject: [EnvService],
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
