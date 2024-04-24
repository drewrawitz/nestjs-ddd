import { Module } from '@nestjs/common';
import { MFAService } from './mfa.service';
import { USER_MFA_REPO_TOKEN } from './mfa.constants';
import { UserMFARepository } from './mfa.repository';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    MFAService,
    {
      provide: USER_MFA_REPO_TOKEN,
      useClass: UserMFARepository,
    },
  ],
  exports: [MFAService, USER_MFA_REPO_TOKEN],
})
export class MFAModule {}
