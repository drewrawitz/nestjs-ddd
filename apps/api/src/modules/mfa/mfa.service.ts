import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  encrypt,
  generateBase64Key,
  generateTOTPSecret,
} from 'src/utils/tokens';
import { ActivateTotpDto, VerifyAuthAction } from '@app/shared';
import { EnvService } from 'src/infrastructure/env/env.service';
import { MFAType } from '@prisma/client';
import { USER_MFA_REPO_TOKEN } from './mfa.constants';
import { IUserMFARepository } from './mfa.interfaces';
import { AUTH_CHALLENGE_MANAGER_TOKEN } from '../auth/domain/auth.constants';
import { IAuthChallengeManager } from '../auth/domain/interfaces/IAuthChallengeManager';

@Injectable()
export class MFAService {
  constructor(
    private envService: EnvService,
    @Inject(USER_MFA_REPO_TOKEN)
    private readonly userMfaRepository: IUserMFARepository,
    @Inject(AUTH_CHALLENGE_MANAGER_TOKEN)
    private readonly authChallengeManager: IAuthChallengeManager,
  ) {}

  async checkForValidChallengeToken(userId: string, token: string) {
    const action = await this.authChallengeManager.verifyAuthChallengeToken(
      userId,
      token,
    );
    return action === VerifyAuthAction.AddAuthenticatorApp;
  }

  async getAllActiveMFAForUser(userId: string) {
    return this.userMfaRepository.getAllActiveMFAForUser(userId);
  }

  async setupTotp() {
    const secret = generateTOTPSecret();
    const qrcode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      key: secret.base32,
      url: secret.otpauth_url,
      qrcode,
    };
  }

  async verifyTotpToken(secret: string, token: string) {
    const isValid = speakeasy.totp.verify({
      secret,
      token,
      encoding: 'base32',
    });

    if (!isValid) {
      throw new ForbiddenException('Invalid TOTP token');
    }

    return isValid;
  }

  async activateTotp(userId: string, body: ActivateTotpDto) {
    const { totp, key, challengeToken } = body;

    const check = await this.checkForValidChallengeToken(
      userId,
      challengeToken,
    );

    if (!check) {
      throw new ForbiddenException('Invalid challenge token');
    }

    const existingMfa =
      await this.userMfaRepository.checkIfUserIsAuthenticatedWithType(
        userId,
        MFAType.TOTP,
      );

    if (existingMfa) {
      throw new ForbiddenException('User already has TOTP enabled');
    }

    await this.verifyTotpToken(key, totp);

    const { ciphertext, iv, authTag } = encrypt(
      this.envService.get('ENCRYPTION_SECRET_KEY'),
      key,
    );

    const backupCode = this.generateBackupCode();

    await this.userMfaRepository.setupUserMfaWithBackupCode({
      userId,
      type: MFAType.TOTP,
      secret: {
        code: ciphertext,
        iv,
        authTag,
      },
      backup: {
        code: backupCode,
      },
    });

    // Remove the token from Redis
    await this.authChallengeManager.removeAuthChallengeToken(
      userId,
      challengeToken,
      VerifyAuthAction.AddAuthenticatorApp,
    );

    return {
      backupCode,
    };
  }

  generateBackupCode() {
    return generateBase64Key();
  }

  async verifyUserTotpToken(userId: string, token: string) {
    const secret = await this.userMfaRepository.getSecretForUser(
      userId,
      MFAType.TOTP,
    );

    if (!secret) {
      return false;
    }

    return this.verifyTotpToken(secret, token);
  }
}
