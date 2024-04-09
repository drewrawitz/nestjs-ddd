import { UserResponseDto } from '../../dto/user-response.dto';
import { User } from '../model/User';

export interface IUsersRepository {
  findByEmail(email: string): Promise<boolean>;
  createUser(user: User): Promise<UserResponseDto>;
  updateUserWithStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<void>;
}
