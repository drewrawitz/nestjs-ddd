import { MFAType } from '@prisma/client';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    mfa?: {
      required: boolean;
      userId: string;
      types: MFAType[];
    };
  }
}
