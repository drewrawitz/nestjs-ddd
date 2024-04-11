import { Injectable, NotFoundException } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { IUsersRepository } from './domain/interfaces/users.repository.interface';
import { User as DomainUser } from './domain/model/User';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private db: PrismaService) {}

  private toDomainUser(user: PrismaUser): DomainUser {
    return new DomainUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  private toUserResponseDto(user: DomainUser): UserResponseDto {
    return new UserResponseDto(user);
  }

  async existsByStripeCustomerId(stripeCustomerId: string) {
    const find = await this.db.user.findUnique({
      where: {
        stripeCustomerId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(find);
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
    });

    if (!user) {
      throw new NotFoundException('User does not exist.');
    }

    const domainUser = this.toDomainUser(user);
    return this.toUserResponseDto(domainUser);
  }

  async createUser(body: DomainUser) {
    const { email, firstName, lastName } = body;
    const user = await this.db.user.create({
      data: {
        email: email.getValue(),
        firstName,
        lastName,
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
    } catch (error) {
      console.error(error);
    }
  }
}
