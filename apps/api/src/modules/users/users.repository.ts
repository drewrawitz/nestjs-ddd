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
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      stripeCustomerId: user.stripeCustomerId,
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
