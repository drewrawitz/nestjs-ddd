import { MFAType } from "@app/prisma/client";

export interface MFAResponse {
  type: MFAType;
  createdAt: Date;
}

export interface IUserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  isEmailVerified: boolean;
  mfa: MFAResponse[];
}
