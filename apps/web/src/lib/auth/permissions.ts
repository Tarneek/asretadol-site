export function canManageContent(role: string): boolean {
  return role === 'admin' || role === 'editor';
}
