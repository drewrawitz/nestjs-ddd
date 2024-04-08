import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  CreateUserRequestDto,
  createUserRequestSchema,
} from './commands/create-user/request.dto';
import { ZodValidationPipe } from 'src/libs/zod-validation-pipe';
import { UsersService } from './users.service';

@Controller('v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Post()
  @UsePipes(new ZodValidationPipe(createUserRequestSchema))
  async create(@Body() body: CreateUserRequestDto) {
    return this.usersService.createUser(body);
  }
}
