import { MFAType, UserMFA } from '@prisma/client';

export interface CreateUserMFAInput {
  userId: string;
  type: MFAType;
  secret: string;
  iv: string;
  authTag: string;
  isEnabled: boolean;
}

export interface IUserMFARepository {
  upsert(userMFA: CreateUserMFAInput): Promise<UserMFA>;
  getAllActiveMFAForUser(userId: string): Promise<UserMFA[]>;
  getSecretForUser(userId: string, type: MFAType): Promise<string | null>;
  checkIfUserIsAuthenticatedWithType(
    userId: string,
    type: MFAType,
  ): Promise<boolean>;
}
