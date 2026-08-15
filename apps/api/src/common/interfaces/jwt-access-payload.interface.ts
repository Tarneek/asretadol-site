import { UserRole } from '../enums/user-role.enum';

export interface JwtAccessPayload {
  sub: string;
  mobile: string;
  email: string | null;
  role: UserRole;
  type: 'access';
}
