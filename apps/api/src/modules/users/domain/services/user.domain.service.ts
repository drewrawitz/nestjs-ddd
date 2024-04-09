import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users.repository';
import { User } from '../model/User';

@Injectable()
export class UserDomainService {
  constructor(private userRepository: UsersRepository) {}

  async validateCreateUser(user: User): Promise<void> {
    const exists = await this.userRepository.findByEmail(user.email.getValue());

    if (exists) {
      throw new BadRequestException('User with this email already exists.');
    }
  }
}
