import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [EventEmitterModule.forRoot(), UsersModule, LoggerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
