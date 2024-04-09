import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { UsersModule } from './modules/users/users.module';
import { EnvModule } from './infrastructure/env/env.module';

@Module({
  imports: [EventEmitterModule.forRoot(), UsersModule, LoggerModule, EnvModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
