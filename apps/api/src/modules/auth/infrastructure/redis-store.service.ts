import { Inject, Injectable } from '@nestjs/common';
import { IUserSessionStore } from '../domain/interfaces/session-store.interface';
import { STORE_TOKEN } from 'src/infrastructure/store/store.constants';
import { IStore } from 'src/infrastructure/store/store.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { ILogger } from 'src/infrastructure/logging/logger.interface';

@Injectable()
export class UserSessionStore implements IUserSessionStore {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(STORE_TOKEN) private readonly store: IStore,
  ) {}

  async saveUserSession(
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.store.set(sessionKey, JSON.stringify(metadata));
    await this.store.sadd(`user_sessions:${userId}`, sessionId);
  }

  async removeSessionFromRedis(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    await this.store.srem(`user_sessions:${userId}`, sessionId);
  }

  async getForgotPasswordTokenByEmail(email: string) {
    return this.store.get(`forgotPassword:${email}`);
  }

  async invalidateForgotPasswordToken(email: string) {
    const existingToken = await this.getForgotPasswordTokenByEmail(email);

    if (!existingToken) {
      return;
    }

    this.logger.log(
      `Existing forgot password token found for ${email}. Invalidating the token now.`,
    );

    try {
      await this.store.del(`token:${existingToken}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate forgot password token for ${email}`,
        {
          error,
        },
      );
    }
  }

  async saveForgotPasswordToken(email: string, token: string) {
    const FORGOT_PASSWORD_TOKEN = `forgotPassword:${email}`;
    const FORGOT_PASSWORD_EXPIRATION = 15 * 60;

    const tokensToAdd = [
      { key: `token:${token}`, value: email },
      { key: FORGOT_PASSWORD_TOKEN, value: token },
    ];

    await Promise.all(
      tokensToAdd.map(async (token) => {
        return this.store.setWithExpiry(
          token.key,
          token.value,
          FORGOT_PASSWORD_EXPIRATION,
        );
      }),
    );
  }
}
