import { MFAType, UserMFA } from '@prisma/client';

export interface CreateUserMFAInput {
  userId: string;
  type: MFAType;
  secret: string;
  iv: string;
  isEnabled: boolean;
}

export interface IUserMFARepository {
  upsert(userMFA: CreateUserMFAInput): Promise<UserMFA>;
  checkIfUserIsAuthenticatedWithType(
    userId: string,
    type: MFAType,
  ): Promise<boolean>;
}
