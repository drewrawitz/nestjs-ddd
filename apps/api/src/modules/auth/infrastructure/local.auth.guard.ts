import { LoginMfaResponseType } from '@app/shared';
import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      const result = (await super.canActivate(context)) as boolean;
      await super.logIn(request);
      return result;
    } catch (error) {
      if (request.session?.mfa?.required) {
        const responseObject = {
          type: 'MFA_REQUIRED',
          message: 'MFA required',
          mfaRequired: true,
          mfaTypes: request.session.mfa.types,
        } as LoginMfaResponseType;

        response.status(HttpStatus.OK).json(responseObject);
        return false;
      } else {
        // Rethrow the original error if it's not related to MFA
        throw error;
      }
    }
  }
}
