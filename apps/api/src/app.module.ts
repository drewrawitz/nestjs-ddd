import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { UsersModule } from './modules/users/users.module';
import { EnvModule } from './infrastructure/env/env.module';
import { SubscriptionsModule } from './modules/subscriptions/application/subscriptions.module';
import { AuthModule } from './modules/auth/application/auth.module';
import { RedisModule } from './infrastructure/store/redis.module';
import { AppCacheModule } from './infrastructure/cache/cache.module';

@Module({
  imports: [
    AppCacheModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    LoggerModule,
    EnvModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
