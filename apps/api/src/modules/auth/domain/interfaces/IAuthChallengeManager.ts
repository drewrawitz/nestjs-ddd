import { VerifyAuthAction } from '../../dto/auth-challenge.dto';

export interface IAuthChallengeManager {
  saveAuthChallengeToken(
    userId: string,
    action: VerifyAuthAction,
  ): Promise<void>;
}
