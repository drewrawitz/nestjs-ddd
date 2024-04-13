import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { UsersModule } from './modules/users/users.module';
import { EnvModule } from './infrastructure/env/env.module';
import { SubscriptionsModule } from './modules/subscriptions/application/subscriptions.module';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CacheModule.register<any>({
      isGlobal: true,
      store: redisStore,
      host: process.env['REDIS_HOST'] || 'localhost',
      port: Number(process.env['REDIS_PORT']) || 6379,
    }),
    UsersModule,
    SubscriptionsModule,
    LoggerModule,
    EnvModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
