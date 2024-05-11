import { Inject, Injectable } from '@nestjs/common';
import { STORE_TOKEN } from 'src/infrastructure/store/store.constants';
import { IStore } from 'src/infrastructure/store/store.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { IAuthChallengeManager } from '../domain/interfaces/IAuthChallengeManager';
import { VerifyAuthAction } from '../dto/auth-challenge.dto';
import { generateToken, hashToken } from 'src/utils/tokens';

@Injectable()
export class AuthChallengeManager implements IAuthChallengeManager {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(STORE_TOKEN) private readonly store: IStore,
  ) {}

  async saveAuthChallengeToken(userId: string, action: VerifyAuthAction) {
    const token = generateToken();
    const hashedToken = await hashToken(token);
    const USER_CHALLENGE_TOKEN = `userChallenge:${userId}:${action}`;
    const AUTH_CHALLENGE_TOKEN = `authChallenge:${hashedToken}`;
    const TOKEN_EXPIRATION = 15 * 60;

    try {
      await Promise.all([
        this.store.setWithExpiry(
          USER_CHALLENGE_TOKEN,
          hashedToken,
          TOKEN_EXPIRATION,
        ),
        this.store.setWithExpiry(
          AUTH_CHALLENGE_TOKEN,
          JSON.stringify({
            userId,
            action,
          }),
          TOKEN_EXPIRATION,
        ),
      ]);
      this.logger.log(`Saved auth challenge tokens: ${action}`, {
        userId,
        action,
      });
    } catch (err) {
      this.logger.error(`Failed to save auth challenge tokens: ${action}`, {
        error: err,
        userId,
        action,
      });
    }

    return token;
  }
}
