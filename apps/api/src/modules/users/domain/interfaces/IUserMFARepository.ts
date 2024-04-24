import { Prisma, UserMFA } from '@prisma/client';

export interface IUserMFARepository {
  create(userMFA: Prisma.UserMFACreateManyInput): Promise<UserMFA>;
}
