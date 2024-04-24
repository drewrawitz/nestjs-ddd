import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { encrypt, generateTOTPSecret } from 'src/utils/tokens';
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
    await this.verifyTotpToken(key, totp);

    const existingMfa =
      await this.userMfaRepository.checkIfUserIsAuthenticatedWithType(
        userId,
        MFAType.TOTP,
      );

    if (existingMfa) {
      throw new ForbiddenException('User already has TOTP enabled');
    }

    const { ciphertext, iv, authTag } = encrypt(
      this.envService.get('ENCRYPTION_SECRET_KEY'),
      key,
    );

    await this.userMfaRepository.upsert({
      userId,
      type: MFAType.TOTP,
      secret: ciphertext,
      iv,
      authTag,
      isEnabled: true,
    });

    return;
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
