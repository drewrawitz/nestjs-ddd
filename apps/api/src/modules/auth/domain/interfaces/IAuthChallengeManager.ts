import { VerifyAuthAction } from '@app/shared';

export interface IAuthChallengeManager {
  saveAuthChallengeToken(
    userId: string,
    action: VerifyAuthAction,
  ): Promise<string>;
}
