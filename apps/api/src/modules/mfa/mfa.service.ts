import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  encrypt,
  generateBase64Key,
  generateTOTPSecret,
} from 'src/utils/tokens';
import { ActivateTotpDto } from './mfa.dto';
import { EnvService } from 'src/infrastructure/env/env.service';
import { MFAType } from '@prisma/client';
import { USER_MFA_REPO_TOKEN } from './mfa.constants';
import { IUserMFARepository } from './mfa.interfaces';

@Injectable()
export class MFAService {
  constructor(
    private envService: EnvService,
    @Inject(USER_MFA_REPO_TOKEN)
    private readonly userMfaRepository: IUserMFARepository,
  ) {}

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
    const { totp, key } = body;

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
        code: backupCode.encrypted.ciphertext,
        iv: backupCode.encrypted.iv,
        authTag: backupCode.encrypted.authTag,
      },
    });

    return {
      backupCode: backupCode.raw,
    };
  }

  generateBackupCode() {
    const key = generateBase64Key();

    return {
      raw: key,
      encrypted: encrypt(
        this.envService.get('ENCRYPTION_MFA_BACKUP_CODE'),
        key,
      ),
    };
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
