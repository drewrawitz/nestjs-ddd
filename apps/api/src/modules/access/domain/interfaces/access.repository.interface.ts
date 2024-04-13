import { GrantedAccess } from '../model/GrantedAccess';

export interface IAccessRepository {
  getGrantedAccessForUser(userId: string): Promise<GrantedAccess[]>;
}
