import { z } from "zod";

export enum AuthChallengeType {
  Email = "email",
}

export enum VerifyAuthAction {
  GenerateBackupCode = "generateBackupCode",
}

export const authChallengeSchema = z
  .object({
    type: z.nativeEnum(AuthChallengeType),
    action: z.nativeEnum(VerifyAuthAction),
  })
  .required();

export type AuthChallengeDto = z.infer<typeof authChallengeSchema>;
