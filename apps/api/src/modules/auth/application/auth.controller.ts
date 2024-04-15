import {
  Body,
  Controller,
  Req,
  Post,
  UseGuards,
  UsePipes,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto, signupSchema } from '../dto/signup.dto';
import { RequestWithUser } from 'src/utils/types';
import { LocalAuthGuard } from '../infrastructure/local.auth.guard';
import { AuthenticatedGuard } from '../infrastructure/authenticated.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signupSchema))
  async signup(@Req() req: RequestWithUser, @Body() body: SignupDto) {
    const user = await this.authService.signup(body);
    await this.authService.login(req, user);

    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser) {
    await this.authService.loginSuccess(req);
    return req.user;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser, @Res() res: Response) {
    res.clearCookie('connect.sid');
    await this.authService.logout(req);

    return res.send();
  }
}
