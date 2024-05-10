import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { UsersModule } from 'src/modules/users/application/users.module';
import { ChangedPasswordListener } from '../domain/listeners/changed-password.listener';
import { ForgotPasswordListener } from '../domain/listeners/forgot-password.listener';
import { LocalStrategy } from '../infrastructure/local.strategy';
import { SessionSerializer } from '../infrastructure/session.serializer';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MFAModule } from 'src/modules/mfa/mfa.module';

@Module({
  imports: [
    MFAModule,
    EmailModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'local', session: true }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    ForgotPasswordListener,
    ChangedPasswordListener,
    SessionSerializer,
  ],
  exports: [AuthService],
})
export class AuthModule {}
