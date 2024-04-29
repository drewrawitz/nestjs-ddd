import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { Redis } from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { AppCacheModule } from './infrastructure/cache/cache.module';
import { EnvModule } from './infrastructure/env/env.module';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { RedisModule } from './infrastructure/store/redis.module';
import { REDIS_CLIENT_TOKEN } from './infrastructure/store/store.constants';
import { AuthModule } from './modules/auth/application/auth.module';
import { SubscriptionsModule } from './modules/subscriptions/application/subscriptions.module';
import { UsersModule } from './modules/users/application/users.module';
import { SharedModule } from './common/modules/shared.module';

@Module({
  imports: [
    AppCacheModule,
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redisClient: Redis) => ({
        throttlers: [{ limit: 15, ttl: seconds(60) }],
        storage: new ThrottlerStorageRedisService(redisClient),
      }),
      inject: [REDIS_CLIENT_TOKEN],
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    SharedModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
