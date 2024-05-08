export enum MFAType {
  TOTP,
}

interface LoginMfaResponseType {
  type: "MFA_REQUIRED";
  message: string;
  mfaRequired: boolean;
  mfaTypes: MFAType[];
}

interface LoginSuccessResponseType {
  type: "LOGIN_SUCCESS";
  id: string;
  email: string;
}

export type LoginResponseDto = LoginMfaResponseType | LoginSuccessResponseType;
