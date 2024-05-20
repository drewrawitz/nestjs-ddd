import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { IUsersRepository } from '../../domain/interfaces/IUsersRepository';
import { User as DomainUser } from '../../domain/model/User';
import { UserResponseDto } from '../../dto/user-response.dto';

type UserWithMfa = Prisma.UserGetPayload<{
  include: { mfa: true };
}>;

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    private db: PrismaService,
  ) {}

  private toDomainUser(user: UserWithMfa): DomainUser {
    return new DomainUser({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      stripeCustomerId: user.stripeCustomerId,
      mfa: user.mfa,
    });
  }

  private toUserResponseDto(user: DomainUser): UserResponseDto {
    return new UserResponseDto(user);
  }

  async getUserIdFromStripeCustomerId(stripeCustomerId: string) {
    const find = await this.db.user.findUnique({
      where: {
        stripeCustomerId,
      },
      select: {
        id: true,
      },
    });

    return find?.id ?? null;
  }

  async existsByEmail(email: string) {
    const find = await this.db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    return Boolean(find);
  }

  async getUserById(userId: string) {
    const user = await this.db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        mfa: {
          where: {
            isEnabled: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist.');
    }

    return this.toDomainUser(user);
  }

  async getUserByEmail(email: string) {
    const formattedEmail = email.toLowerCase().trim();
    const user = await this.db.user.findUnique({
      where: {
        email: formattedEmail,
      },
      include: {
        mfa: {
          where: {
            isEnabled: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist.');
    }

    return this.toDomainUser(user);
  }

  async createUser(body: DomainUser) {
    const { email, passwordHash, firstName, lastName } = body;
    const user = await this.db.user.create({
      data: {
        email: email.getValue(),
        passwordHash,
        firstName,
        lastName,
      },
      include: {
        mfa: {
          where: {
            isEnabled: true,
          },
        },
      },
    });

    const domainUser = this.toDomainUser(user);
    return this.toUserResponseDto(domainUser);
  }

  async updateUserWithStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<void> {
    try {
      await this.db.user.update({
        where: {
          id: userId,
        },
        data: {
          stripeCustomerId,
        },
      });
      this.logger.log('Successfully updated user with Stripe Customer ID', {
        userId,
        stripeCustomerId,
      });
    } catch (error) {
      this.logger.error('Failed to update user with Stripe Customer ID', {
        error,
        params: {
          userId,
          stripeCustomerId,
        },
      });
    }
  }

  async updateUserPassword(userId: string, password: string): Promise<void> {
    try {
      await this.db.user.update({
        where: {
          id: userId,
        },
        data: {
          passwordHash: password,
        },
      });
      this.logger.log('Successfully updated user password', {
        userId,
      });
    } catch (error) {
      this.logger.error('Failed to update user password', {
        error,
        params: {
          userId,
        },
      });
      throw new InternalServerErrorException('Something went wrong.');
    }
  }
}
