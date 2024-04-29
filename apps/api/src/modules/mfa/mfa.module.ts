import { Module } from '@nestjs/common';
import { MFAService } from './mfa.service';

@Module({
  providers: [MFAService],
  exports: [MFAService],
})
export class MFAModule {}
