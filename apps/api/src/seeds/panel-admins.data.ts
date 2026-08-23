import { UserRole } from '../common/enums/user-role.enum';

/** CMS panel operators — passwords are bcrypt-hashed before persistence. */
export const PANEL_ADMINS = [
  {
    mobile: '09154759516',
    password: 'Asrtaadol.123',
    displayName: 'اپراتور تحریریه ۱',
    role: UserRole.Admin,
  },
  {
    mobile: '09123027510',
    password: 'Asrtaadol.123',
    displayName: 'اپراتور تحریریه ۲',
    role: UserRole.Admin,
  },
] as const;

export type PanelAdminSeed = (typeof PANEL_ADMINS)[number];
