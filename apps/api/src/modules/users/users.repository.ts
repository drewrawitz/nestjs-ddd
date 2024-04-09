import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User as DomainUser } from './domain/model/User';
import { IUsersRepository } from './domain/interfaces/users.repository.interface';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private db: PrismaService) {}

  async findByEmail(email: string) {
    const find = await this.db.user.findUnique({
      where: {
        email,
      },
    });

    return Boolean(find);
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

    const domainUser = new DomainUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return new UserResponseDto(domainUser);
  }
}