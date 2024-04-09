import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { LoggerModule } from './infrastructure/logging/logger.module';

@Module({
  imports: [UsersModule, LoggerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
