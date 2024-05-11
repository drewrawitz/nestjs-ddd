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
    const AUTH_CHALLENGE_TOKEN = `authChallenge:${userId}:${action}`;
    const AUTH_CHALLENGE_EXPIRATION = 15 * 60;
    const token = generateToken();
    const hashedToken = await hashToken(token);
    this.logger.log(`Saving auth challenge token: ${action}`, {
      userId,
      action,
    });

    await this.store.setWithExpiry(
      AUTH_CHALLENGE_TOKEN,
      hashedToken,
      AUTH_CHALLENGE_EXPIRATION,
    );

    return token;
  }
}
