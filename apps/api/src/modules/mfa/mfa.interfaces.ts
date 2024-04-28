import { MFAType, UserMFA } from '@prisma/client';

interface EncryptedCode {
  code: string;
  iv: string;
  authTag: string;
}

export interface MfaSetupDataInput {
  userId: string;
  type: MFAType;
  secret: EncryptedCode;
  backup: EncryptedCode;
}

export interface IUserMFARepository {
  setupUserMfaWithBackupCode(data: MfaSetupDataInput): Promise<void>;
  getAllActiveMFAForUser(userId: string): Promise<UserMFA[]>;
  getSecretForUser(userId: string, type: MFAType): Promise<string | null>;
  checkIfUserIsAuthenticatedWithType(
    userId: string,
    type: MFAType,
  ): Promise<boolean>;
}
