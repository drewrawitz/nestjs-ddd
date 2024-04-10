import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { User } from '../model/User';
import { USER_REPO_TOKEN } from '../../users.constants';
import { IUsersRepository } from '../interfaces/users.repository.interface';

@Injectable()
export class UserDomainService {
  constructor(
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
  ) {}

  async validateCreateUser(user: User): Promise<void> {
    const exists = await this.userRepository.existsByEmail(
      user.email.getValue(),
    );

    if (exists) {
      throw new BadRequestException('User with this email already exists.');
    }
  }
}
