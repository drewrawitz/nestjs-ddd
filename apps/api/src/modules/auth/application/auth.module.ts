import { Module } from '@nestjs/common';
import { EventModule } from 'src/infrastructure/events/event.module';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthService } from './auth.service';
import { PASSWORD_HASHING_TOKEN } from './auth.constants';
import { PasswordHashingService } from '../infrastructure/password-hashing.service';

@Module({
  imports: [EventModule, PrismaModule, UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: PASSWORD_HASHING_TOKEN,
      useClass: PasswordHashingService,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
