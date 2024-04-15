import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { UsersModule } from './modules/users/users.module';
import { EnvModule } from './infrastructure/env/env.module';
import { SubscriptionsModule } from './modules/subscriptions/application/subscriptions.module';
import { AuthModule } from './modules/auth/application/auth.module';
import { RedisModule } from './infrastructure/store/redis.module';
import { AppCacheModule } from './infrastructure/cache/cache.module';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { REDIS_CLIENT_TOKEN } from './infrastructure/store/store.constants';
import { Redis } from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';

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
    RedisModule,
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    LoggerModule,
    EnvModule,
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
