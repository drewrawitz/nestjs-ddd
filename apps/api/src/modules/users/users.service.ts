import { Injectable } from '@nestjs/common';
import { CreateUserRequestDto } from './commands/create-user/request.dto';
import { UsersRepository } from './users.repository';
import { User } from './domain/user.entity';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  async createUser(body: CreateUserRequestDto) {
    const { email, firstName, lastName } = body;
    const user = new User({
      id: undefined,
      email,
      firstName,
      lastName,
    });

    return await this.userRepository.createUser(user);
  }
}
