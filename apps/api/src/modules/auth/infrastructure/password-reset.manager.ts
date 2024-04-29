import { Inject, Injectable } from '@nestjs/common';
import { IPasswordResetManager } from '../domain/interfaces/IPasswordResetManager';
import { STORE_TOKEN } from 'src/infrastructure/store/store.constants';
import { IStore } from 'src/infrastructure/store/store.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { hashToken } from 'src/utils/tokens';

@Injectable()
export class PasswordResetManager implements IPasswordResetManager {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(STORE_TOKEN) private readonly store: IStore,
  ) {}

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
    const hashedToken = await hashToken(token);

    const tokensToAdd = [
      { key: `token:${hashedToken}`, value: email },
      { key: FORGOT_PASSWORD_TOKEN, value: hashedToken },
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

  async removeForgotPasswordTokens(email: string, token: string) {
    const FORGOT_PASSWORD_TOKEN = `forgotPassword:${email}`;
    const TOKEN = `token:${token}`;
    const tokensToRemove = [FORGOT_PASSWORD_TOKEN, TOKEN];

    await Promise.all(
      tokensToRemove.map(async (token) => {
        return this.store.del(token);
      }),
    );
  }

  async getEmailFromForgotPasswordToken(token: string) {
    console.log('get email', token);
    return await this.store.get(`token:${token}`);
  }
}
