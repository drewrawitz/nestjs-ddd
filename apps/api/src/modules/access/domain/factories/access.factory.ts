import { GrantedAccess as GrantedAccessPrisma } from '@prisma/client';
import { GrantedAccess as GrantedAccessDomain } from '../model/GrantedAccess';

export class AccessFactory {
  static createFromSchema(data: GrantedAccessPrisma): GrantedAccessDomain {
    return new GrantedAccessDomain({
      userId: data.userId,
      grantedBy: data.grantedBy,
      productId: data.productId,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  }
}
