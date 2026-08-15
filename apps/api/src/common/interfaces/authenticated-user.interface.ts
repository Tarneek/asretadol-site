import { UserRole } from '../enums/user-role.enum';

export interface AuthenticatedUser {
  id: string;
  mobile: string;
  email: string | null;
  role: UserRole;
}
