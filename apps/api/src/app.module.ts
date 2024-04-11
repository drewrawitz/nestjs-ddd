import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { UsersModule } from './modules/users/users.module';
import { EnvModule } from './infrastructure/env/env.module';
import { SubscriptionsModule } from './modules/subscriptions/application/subscriptions.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    UsersModule,
    SubscriptionsModule,
    LoggerModule,
    EnvModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
