import { MFAType } from '@prisma/client';
import { User } from '../domain/model/User';
import { IUserResponse } from '@app/shared';

export class UserResponseDto implements IUserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  isEmailVerified: boolean;
  mfa: {
    type: MFAType;
    createdAt: Date;
  }[];

  constructor(user: User) {
    this.id = user.id!;
    this.email = user.email.getValue();
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = user.fullName;
    this.isEmailVerified = user.isEmailVerified;
    this.mfa = user.mfa;
  }
}
