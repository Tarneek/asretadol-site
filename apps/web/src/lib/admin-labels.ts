/** Persian labels for the newsroom CMS (admin panel). */

export const ADMIN_STATUS_LABELS = {
  draft: 'پیش‌نویس',
  published: 'منتشرشده',
  scheduled: 'زمان‌بندی‌شده',
  archived: 'بایگانی',
} as const;

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  admin: 'مدیر',
  editor: 'سردبیر',
  author: 'خبرنگار',
};

export function adminStatusLabel(status: string): string {
  return ADMIN_STATUS_LABELS[status as keyof typeof ADMIN_STATUS_LABELS] ?? status;
}

export function adminRoleLabel(role: string): string {
  return ADMIN_ROLE_LABELS[role.toLowerCase()] ?? role;
}
