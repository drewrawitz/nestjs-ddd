import { Inject, Injectable } from '@nestjs/common';
import { ACCESS_REPO_TOKEN } from './access.constants';
import { IAccessRepository } from '../domain/interfaces/access.repository.interface';

@Injectable()
export class AccessService {
  constructor(
    @Inject(ACCESS_REPO_TOKEN)
    private readonly accessRepo: IAccessRepository,
  ) {}

  async getAccessForUser(userId: string) {
    return await this.accessRepo.getGrantedAccessForUser(userId);
  }
}
