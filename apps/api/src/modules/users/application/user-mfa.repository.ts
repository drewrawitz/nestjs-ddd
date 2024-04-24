import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserMFA, MFAType } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import {
  CreateUserMFAInput,
  IUserMFARepository,
} from '../domain/interfaces/IUserMFARepository';

@Injectable()
export class UserMFARepository implements IUserMFARepository {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    private db: PrismaService,
  ) {}

  async create(data: CreateUserMFAInput): Promise<UserMFA> {
    try {
      const create = await this.db.userMFA.create({ data });
      this.logger.log('Successfully created a new User MFA record', {
        data,
      });

      return create;
    } catch (error) {
      this.logger.error('Failed to create User MFA record', {
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
}
