export enum MFAType {
  TOTP,
  SMS,
}

export interface LoginMfaResponseType {
  type: "MFA_REQUIRED";
  message: string;
  mfaRequired: boolean;
  mfaTypes: MFAType[];
}

export interface LoginSuccessResponseType {
  type: "LOGIN_SUCCESS";
  id: string;
  email: string;
}

export type LoginResponseDto = LoginMfaResponseType | LoginSuccessResponseType;
