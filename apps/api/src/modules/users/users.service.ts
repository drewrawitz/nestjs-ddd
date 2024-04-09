import { Inject, Injectable } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './domain/model/User';
import { UserDomainService } from './domain/services/user.domain.service';
import { ILogger } from 'src/application/interfaces/logger.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';

@Injectable()
export class UsersService {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
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
      await this.userDomainService.validateCreateUser(user);
      return await this.userRepository.createUser(user);
    } catch (err) {
      this.logger.error('error: createUser()', err.stack, { body });

      throw err;
    }
  }
}
