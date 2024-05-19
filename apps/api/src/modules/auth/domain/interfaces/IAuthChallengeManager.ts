import { VerifyAuthAction } from '@app/shared';

export interface IAuthChallengeManager {
  saveAuthChallengeToken(
    userId: string,
    action: VerifyAuthAction,
  ): Promise<string>;
  verifyAuthChallengeToken(
    userId: string,
    token: string,
  ): Promise<null | VerifyAuthAction>;
  removeAuthChallengeToken(
    userId: string,
    token: string,
    action: VerifyAuthAction,
  ): Promise<void>;
}
