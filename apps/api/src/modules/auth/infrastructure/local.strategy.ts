import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { RequestWithUser } from 'src/utils/types';
import { MFAService } from 'src/modules/mfa/mfa.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private mfaService: MFAService,
  ) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  async validate(
    req: RequestWithUser,
    email: string,
    password: string,
  ): Promise<any> {
    if (req.isAuthenticated?.()) {
      throw new ForbiddenException(
        'Already authenticated with an active session',
      );
    }

    // Clear any existing MFA data from the session at the start of authentication
    delete req.session.mfa;

    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    // Check if MFA is enabled for this user
    const activeMFA = await this.mfaService.getAllActiveMFAForUser(user.id);
    if (activeMFA.length > 0) {
      req.session.mfa = {
        required: true,
        userId: user.id,
        types: activeMFA.map((mfa) => mfa.type),
      };
      return null; // Stop here and require MFA verification
    }

    return user;
  }
}
