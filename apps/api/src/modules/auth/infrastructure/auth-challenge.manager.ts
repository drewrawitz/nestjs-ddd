import { Inject, Injectable } from '@nestjs/common';
import { STORE_TOKEN } from 'src/infrastructure/store/store.constants';
import { IStore } from 'src/infrastructure/store/store.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { IAuthChallengeManager } from '../domain/interfaces/IAuthChallengeManager';
import { VerifyAuthAction } from '@app/shared';
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

    // Check if the user has an existing token active and remove
    const existingToken = await this.store.get(USER_CHALLENGE_TOKEN);
    if (existingToken) {
      await this.store.del(`authChallenge:${existingToken}`);
    }

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

  async verifyAuthChallengeToken(
    userId: string,
    token: string,
  ): Promise<null | VerifyAuthAction> {
    const hashedToken = await hashToken(token);
    const AUTH_CHALLENGE_TOKEN = `authChallenge:${hashedToken}`;
    const value = await this.store.get(AUTH_CHALLENGE_TOKEN);

    if (!value) {
      return null;
    }

    const parsedValue = JSON.parse(value);

    if (parsedValue.userId !== userId) {
      return null;
    }

    return parsedValue.action as VerifyAuthAction;
  }

  async removeAuthChallengeToken(
    userId: string,
    token: string,
    action: VerifyAuthAction,
  ): Promise<void> {
    const hashedToken = await hashToken(token);
    const AUTH_CHALLENGE_TOKEN = `authChallenge:${hashedToken}`;
    const USER_CHALLENGE_TOKEN = `userChallenge:${userId}:${action}`;

    await this.store.del(AUTH_CHALLENGE_TOKEN);
    await this.store.del(USER_CHALLENGE_TOKEN);
  }
}
