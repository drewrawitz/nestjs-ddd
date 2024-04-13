import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/libs/zod-validation-pipe';
import { AuthService } from './auth.service';
import { SignupDto, signupSchema } from '../dto/signup.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signupSchema))
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }
}
