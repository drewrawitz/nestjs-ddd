import {
  Body,
  Controller,
  Req,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/libs/zod-validation-pipe';
import { AuthService } from './auth.service';
import { SignupDto, signupSchema } from '../dto/signup.dto';
import { FastifyRequestWithUser } from 'src/utils/types';
import { LocalAuthGuard } from './local.auth.guard';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signupSchema))
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: FastifyRequestWithUser) {
    return req.user;
  }
}
