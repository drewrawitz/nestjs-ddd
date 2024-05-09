import { MFAType } from "@app/prisma/client";

export interface LoginMfaResponseType {
  type: "MFA_REQUIRED";
  message: string;
  mfaRequired: boolean;
  mfaTypes: MFAType[];
  tempKey: string;
}

export interface LoginSuccessResponseType {
  type: "LOGIN_SUCCESS";
  id: string;
  email: string;
}

export type LoginResponseDto = LoginMfaResponseType | LoginSuccessResponseType;
