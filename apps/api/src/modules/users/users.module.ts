import { Module } from '@nestjs/common';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { EventModule } from 'src/infrastructure/events/event.module';
import { PrismaModule } from '../database/prisma.module';
import { UserCreatedListener } from './domain/listeners/user-created.listener';
import { UserDomainService } from './domain/services/user.domain.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, EventModule, EmailModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UserCreatedListener,
    UsersService,
    UserDomainService,
  ],
})
export class UsersModule {}
