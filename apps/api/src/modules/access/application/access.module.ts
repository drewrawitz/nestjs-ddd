import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { ACCESS_REPO_TOKEN } from './access.constants';
import { AccessRepository } from './access.repository';
import { AccessService } from './access.service';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ACCESS_REPO_TOKEN,
      useClass: AccessRepository,
    },
    AccessService,
  ],
  exports: [AccessService],
})
export class AccessModule {}
