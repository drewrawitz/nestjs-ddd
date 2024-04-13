import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/libs/zod-validation-pipe';
import {
  CreateUserRequestDto,
  createUserRequestSchema,
} from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserRequestSchema))
  async create(@Body() body: CreateUserRequestDto) {
    return await this.usersService.createUser(body);
  }

  @Get('/:userId')
  async getUserById(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.usersService.getUserDetails(userId);
  }
}
