import { Module } from '@nestjs/common';
import { EventModule } from 'src/infrastructure/events/event.module';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthService } from './auth.service';

@Module({
  imports: [EventModule, PrismaModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
