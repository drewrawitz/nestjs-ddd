import { GrantedAccess } from '../domain/model/GrantedAccess';

export class AccessResponseDto {
  isActive: boolean;
  productId: string;
  expiresAt: Date | null;

  constructor(data: GrantedAccess) {
    this.isActive = data.isActive();
    this.productId = data.productId;
    this.expiresAt = data.expiresAt;
  }
}
