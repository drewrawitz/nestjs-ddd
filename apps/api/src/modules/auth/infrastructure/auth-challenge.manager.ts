import { Inject, Injectable } from '@nestjs/common';
import { STORE_TOKEN } from 'src/infrastructure/store/store.constants';
import { IStore } from 'src/infrastructure/store/store.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { IAuthChallengeManager } from '../domain/interfaces/IAuthChallengeManager';
import { VerifyAuthAction } from '@app/shared';
import { generateToken, hashToken } from 'src/utils/tokens';

const TOKEN_EXPIRATION = 15 * 60;
const USER_CHALLENGE_PREFIX = 'userChallenge:';
const AUTH_CHALLENGE_PREFIX = 'authChallenge:';

@Injectable()
export class AuthChallengeManager implements IAuthChallengeManager {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(STORE_TOKEN) private readonly store: IStore,
  ) {}

  private async getHashedToken(token: string): Promise<string> {
    return hashToken(token);
  }

  private async removeExistingToken(
    userId: string,
    action: VerifyAuthAction,
  ): Promise<void> {
    const existingToken = await this.store.get(
      `${USER_CHALLENGE_PREFIX}${userId}:${action}`,
    );
    if (existingToken) {
      await this.store.del(`${AUTH_CHALLENGE_PREFIX}${existingToken}`);
    }
  }

  async saveAuthChallengeToken(userId: string, action: VerifyAuthAction) {
    const token = generateToken();
    const hashedToken = await this.getHashedToken(token);

    const USER_CHALLENGE_TOKEN = `${USER_CHALLENGE_PREFIX}${userId}:${action}`;
    const AUTH_CHALLENGE_TOKEN = `${AUTH_CHALLENGE_PREFIX}${hashedToken}`;

    await this.removeExistingToken(userId, action);

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
    const hashedToken = await this.getHashedToken(token);
    const AUTH_CHALLENGE_TOKEN = `${AUTH_CHALLENGE_PREFIX}${hashedToken}`;
    const value = await this.store.get(AUTH_CHALLENGE_TOKEN);

    if (!value) {
      this.logger.warn(`No auth challenge token found for user: ${userId}`);
      return null;
    }

    const parsedValue = JSON.parse(value);

    if (parsedValue.userId !== userId) {
      this.logger.warn(
        `Auth challenge token user mismatch: expected ${userId}, found ${parsedValue.userId}`,
      );
      return null;
    }

    return parsedValue.action as VerifyAuthAction;
  }

  async removeAuthChallengeToken(
    userId: string,
    token: string,
    action: VerifyAuthAction,
  ): Promise<void> {
    const hashedToken = await this.getHashedToken(token);
    const AUTH_CHALLENGE_TOKEN = `${AUTH_CHALLENGE_PREFIX}${hashedToken}`;
    const USER_CHALLENGE_TOKEN = `${USER_CHALLENGE_PREFIX}${userId}:${action}`;

    try {
      await Promise.all([
        this.store.del(AUTH_CHALLENGE_TOKEN),
        this.store.del(USER_CHALLENGE_TOKEN),
      ]);
      this.logger.log(
        `Removed auth challenge tokens for user: ${userId}, action: ${action}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to remove auth challenge tokens for user: ${userId}, action: ${action}`,
        { error: err, userId, action },
      );
    }
  }
}
