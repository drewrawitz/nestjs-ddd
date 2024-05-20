import { MFAType } from "@app/prisma/client";

export interface IUserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  isEmailVerified: boolean;
}

export interface MFAResponse {
  type: MFAType;
  createdAt: Date;
}
