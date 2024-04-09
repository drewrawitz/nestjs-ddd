import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from './modules/users/users.module';
import { LoggerModule } from './infrastructure/logging/logger.module';

@Module({
  imports: [EventEmitterModule.forRoot(), UsersModule, LoggerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
