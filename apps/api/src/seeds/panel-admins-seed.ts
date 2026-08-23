import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { normalizeIranianMobile } from '../common/utils/iranian-mobile.util';
import { User } from '../modules/users/entities/user.entity';
import { PANEL_ADMINS, PanelAdminSeed } from './panel-admins.data';

/** Must match UsersService bcrypt cost. */
const BCRYPT_ROUNDS = 12;

export type PanelAdminUpsertResult = {
  mobile: string;
  action: 'created' | 'updated';
};

async function upsertPanelAdmin(
  dataSource: DataSource,
  admin: PanelAdminSeed,
): Promise<PanelAdminUpsertResult> {
  const mobile = normalizeIranianMobile(admin.mobile);
  if (!mobile) {
    throw new Error(`Invalid mobile for panel admin seed: ${admin.mobile}`);
  }

  const usersRepo = dataSource.getRepository(User);
  const passwordHash = await bcrypt.hash(admin.password, BCRYPT_ROUNDS);
  const existing = await usersRepo.findOne({ where: { mobile } });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.displayName = admin.displayName;
    existing.role = admin.role;
    existing.isActive = true;
    await usersRepo.save(existing);
    return { mobile, action: 'updated' };
  }

  await usersRepo.save(
    usersRepo.create({
      mobile,
      email: null,
      passwordHash,
      displayName: admin.displayName,
      role: admin.role,
      isActive: true,
    }),
  );
  return { mobile, action: 'created' };
}

export async function runPanelAdminsSeed(
  dataSource: DataSource,
): Promise<PanelAdminUpsertResult[]> {
  const results: PanelAdminUpsertResult[] = [];
  for (const admin of PANEL_ADMINS) {
    results.push(await upsertPanelAdmin(dataSource, admin));
  }
  return results;
}
