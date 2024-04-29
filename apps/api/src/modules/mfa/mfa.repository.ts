import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MFAType } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { IUserMFARepository, MfaSetupDataInput } from './mfa.interfaces';
import { decrypt } from 'src/utils/tokens';
import { EnvService } from 'src/infrastructure/env/env.service';
import { IPasswordHashingService } from '../auth/domain/interfaces/IPasswordHashingService';
import { PASSWORD_HASHING_TOKEN } from '../auth/domain/auth.constants';

@Injectable()
export class UserMFARepository implements IUserMFARepository {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    private envService: EnvService,
    private db: PrismaService,
    @Inject(PASSWORD_HASHING_TOKEN)
    private passwordHashingService: IPasswordHashingService,
  ) {}

  async getAllActiveMFAForUser(userId: string) {
    return this.db.userMFA.findMany({
      where: {
        userId,
        isEnabled: true,
      },
    });
  }

  async setupUserMfaWithBackupCode(data: MfaSetupDataInput): Promise<void> {
    const { userId, type, secret, backup } = data;
    const hashedCode = await this.passwordHashingService.hash(backup.code);

    try {
      await this.db.$transaction(async (tx) => {
        await tx.userMFA.upsert({
          where: {
            userId_type: {
              userId,
              type,
            },
          },
          create: {
            userId,
            type,
            secret: secret.code,
            iv: secret.iv,
            authTag: secret.authTag,
            isEnabled: true,
          },
          update: {
            secret: secret.code,
            iv: secret.iv,
            authTag: secret.authTag,
            isEnabled: true,
          },
        });

        this.logger.log('Successfully upserted a new User MFA record', {
          userId: data.userId,
          type: data.type,
        });

        await tx.userBackupCode.upsert({
          where: { userId },
          create: {
            userId,
            hashedCode,
          },
          update: {
            hashedCode,
          },
        });

        this.logger.log('Successfully created a new User Backup Code', {
          userId,
        });
      });
    } catch (error) {
      this.logger.error('Failed to setup MFA for user', {
        error,
        userId,
      });
      throw new InternalServerErrorException('Something went wrong.');
    }
  }

  async checkIfUserIsAuthenticatedWithType(userId: string, type: MFAType) {
    const find = await this.db.userMFA.findFirst({
      where: {
        userId,
        type,
        isEnabled: true,
      },
    });

    return Boolean(find);
  }

  async getSecretForUser(userId: string, type: MFAType) {
    const find = await this.db.userMFA.findFirst({
      where: {
        userId,
        type,
      },
      select: {
        iv: true,
        authTag: true,
        secret: true,
      },
    });

    if (!find) return null;

    return decrypt(
      this.envService.get('ENCRYPTION_SECRET_KEY'),
      find.secret,
      find.iv,
      find.authTag,
    );
  }
}
