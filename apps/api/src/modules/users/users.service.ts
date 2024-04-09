import { Injectable } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './domain/model/User';
import { UserDomainService } from './domain/services/user.domain.service';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    private userDomainService: UserDomainService,
  ) {}

  async createUser(body: CreateUserRequestDto) {
    const { email, firstName, lastName } = body;
    const user = new User({
      id: undefined,
      email,
      firstName,
      lastName,
    });

    try {
      await this.userDomainService.canCreateUser(user);
      return await this.userRepository.createUser(user);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
