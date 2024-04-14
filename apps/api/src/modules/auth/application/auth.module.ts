import { Module } from '@nestjs/common';
import { EventModule } from 'src/infrastructure/events/event.module';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthService } from './auth.service';
import {
  PASSWORD_HASHING_TOKEN,
  SESSION_STORE_TOKEN,
} from '../domain/auth.constants';
import { PasswordHashingService } from '../infrastructure/password-hashing.service';
import { LocalStrategy } from '../infrastructure/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from '../infrastructure/session.serializer';
import { StoreModule } from 'src/infrastructure/store/store.module';
import { UserSessionStore } from '../infrastructure/redis-store.service';

@Module({
  imports: [
    EventModule,
    PrismaModule,
    UsersModule,
    PassportModule.register({ session: true }),
    StoreModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: PASSWORD_HASHING_TOKEN,
      useClass: PasswordHashingService,
    },
    {
      provide: SESSION_STORE_TOKEN,
      useClass: UserSessionStore,
    },
    LocalStrategy,
    SessionSerializer,
  ],
  exports: [AuthService],
})
export class AuthModule {}
