import { Injectable } from '@nestjs/common';
import { GrantedAccess as GrantedAccessPrisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { AccessFactory } from '../domain/factories/access.factory';
import { IAccessRepository } from '../domain/interfaces/access.repository.interface';

@Injectable()
export class AccessRepository implements IAccessRepository {
  constructor(private db: PrismaService) {}

  private toDomain(data: GrantedAccessPrisma) {
    return AccessFactory.createFromSchema(data);
  }

  async getGrantedAccessForUser(userId: string) {
    const row = await this.db.grantedAccess.findMany({
      where: {
        userId,
      },
    });

    return row.map((r) => this.toDomain(r));
  }
}
