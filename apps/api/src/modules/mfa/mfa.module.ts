import { Module } from '@nestjs/common';
import { MFAService } from './mfa.service';
import { USER_MFA_REPO_TOKEN } from './mfa.constants';
import { UserMFARepository } from './mfa.repository';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { PasswordHashingService } from '../auth/infrastructure/password-hashing.service';
import { PASSWORD_HASHING_TOKEN } from '../auth/domain/auth.constants';

@Module({
  imports: [PrismaModule],
  providers: [
    MFAService,
    {
      provide: PASSWORD_HASHING_TOKEN,
      useClass: PasswordHashingService,
    },
    {
      provide: USER_MFA_REPO_TOKEN,
      useClass: UserMFARepository,
    },
  ],
  exports: [MFAService, USER_MFA_REPO_TOKEN],
})
export class MFAModule {}
