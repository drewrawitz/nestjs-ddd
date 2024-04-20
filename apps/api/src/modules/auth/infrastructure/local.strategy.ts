import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { RequestWithUser } from 'src/utils/types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  async validate(
    req: RequestWithUser,
    email: string,
    password: string,
  ): Promise<any> {
    if (req.isAuthenticated && req.isAuthenticated()) {
      throw new ForbiddenException(
        'Already authenticated with an active session',
      );
    }

    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    return user;
  }
}
