import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserMFA, MFAType } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { CreateUserMFAInput, IUserMFARepository } from './mfa.interfaces';
import { decrypt } from 'src/utils/tokens';
import { EnvService } from 'src/infrastructure/env/env.service';

@Injectable()
export class UserMFARepository implements IUserMFARepository {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    private envService: EnvService,
    private db: PrismaService,
  ) {}

  async getAllActiveMFAForUser(userId: string) {
    return this.db.userMFA.findMany({
      where: {
        userId,
        isEnabled: true,
      },
    });
  }

  async upsert(data: CreateUserMFAInput): Promise<UserMFA> {
    try {
      const create = await this.db.userMFA.upsert({
        where: {
          userId_type: {
            userId: data.userId,
            type: data.type,
          },
        },
        create: data,
        update: { isEnabled: true },
      });
      this.logger.log('Successfully upserted a new User MFA record', {
        data,
      });

      return create;
    } catch (error) {
      this.logger.error('Failed to upsert User MFA record', {
        error,
        data,
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
