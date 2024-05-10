import { MFAType } from "@app/prisma/client";
import { IUserResponse } from "../user/user.interface";

export interface LoginMfaResponseType {
  type: "MFA_REQUIRED";
  data: {
    message: string;
    mfaRequired: boolean;
    mfaTypes: MFAType[];
    tempKey: string;
  };
}

export interface LoginSuccessResponseType {
  type: "LOGIN_SUCCESS";
  data: IUserResponse;
}

export type LoginResponseDto = LoginMfaResponseType | LoginSuccessResponseType;
