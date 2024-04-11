import { UserResponseDto } from '../../dto/user-response.dto';
import { User } from '../model/User';

export interface IUsersRepository {
  existsByEmail(email: string): Promise<boolean>;
  existsByStripeCustomerId(stripeCustomerId: string): Promise<boolean>;
  getUserById(userId: string): Promise<User>;
  createUser(user: User): Promise<UserResponseDto>;
  updateUserWithStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<void>;
}
