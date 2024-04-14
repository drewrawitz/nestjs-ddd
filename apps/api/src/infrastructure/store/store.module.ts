import { Module } from '@nestjs/common';
import { STORE_TOKEN } from './store.constants';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisStoreService } from './redis.store';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [
    {
      provide: STORE_TOKEN,
      useClass: RedisStoreService,
    },
  ],
  exports: [STORE_TOKEN],
})
export class StoreModule {}
