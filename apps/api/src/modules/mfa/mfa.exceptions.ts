import { HttpException, HttpStatus } from '@nestjs/common';

export class MfaRequiredException extends HttpException {
  constructor(
    public tempKey: string,
    public mfaTypes: string[],
  ) {
    super(
      {
        statusCode: HttpStatus.OK,
        message: 'MFA required',
        mfaRequired: true,
        mfaTypes: mfaTypes,
        tempKey: tempKey,
      },
      HttpStatus.OK,
    );
  }
}
