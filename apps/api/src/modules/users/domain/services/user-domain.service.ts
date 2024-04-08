import { Injectable } from '@nestjs/common';
import { User } from '../user.entity';

@Injectable()
export class UserDomainService {
  public validateUserCreation(user: User): boolean {
    // Implement validation logic here
    console.log('validate user creation', user);
    return true;
  }
}
