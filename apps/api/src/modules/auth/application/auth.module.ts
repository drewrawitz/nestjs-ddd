import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { EventModule } from 'src/infrastructure/events/event.module';
import { RedisModule } from 'src/infrastructure/store/redis.module';
import { UsersModule } from 'src/modules/users/application/users.module';
import {
  PASSWORD_HASHING_TOKEN,
  PASSWORD_RESET_MANAGER_TOKEN,
  USER_SESSION_MANAGER_TOKEN,
} from '../domain/auth.constants';
import { ChangedPasswordListener } from '../domain/listeners/changed-password.listener';
import { ForgotPasswordListener } from '../domain/listeners/forgot-password.listener';
import { LocalStrategy } from '../infrastructure/local.strategy';
import { PasswordHashingService } from '../infrastructure/password-hashing.service';
import { PasswordResetManager } from '../infrastructure/password-reset.manager';
import { SessionSerializer } from '../infrastructure/session.serializer';
import { UserSessionManager } from '../infrastructure/user-session.manager';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MFAModule } from 'src/modules/mfa/mfa.module';

@Module({
  imports: [
    MFAModule,
    RedisModule,
    EventModule,
    EmailModule,
    PrismaModule,
    UsersModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: PASSWORD_HASHING_TOKEN,
      useClass: PasswordHashingService,
    },
    {
      provide: PASSWORD_RESET_MANAGER_TOKEN,
      useClass: PasswordResetManager,
    },
    {
      provide: USER_SESSION_MANAGER_TOKEN,
      useClass: UserSessionManager,
    },
    LocalStrategy,
    ForgotPasswordListener,
    ChangedPasswordListener,
    SessionSerializer,
  ],
  exports: [AuthService],
})
export class AuthModule {}
