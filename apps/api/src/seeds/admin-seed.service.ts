import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../common/enums/user-role.enum';
import { AppConfig } from '../config/configuration';
import { UsersService } from '../modules/users/users.service';

/** Panel operators requested for CMS access (passwords bcrypt-hashed on create). */
const PANEL_OPERATORS = [
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

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensurePanelOperators();
    await this.seedLegacyAdminIfEnabled();
  }

  private async ensurePanelOperators(): Promise<void> {
    for (const operator of PANEL_OPERATORS) {
      const before = await this.usersService.findByMobile(operator.mobile);
      await this.usersService.ensureUser({
        mobile: operator.mobile,
        password: operator.password,
        displayName: operator.displayName,
        role: operator.role,
      });
      if (!before) {
        this.logger.warn(
          `[CMS] Ensured panel user mobile=${operator.mobile} (password hashed)`,
        );
      }
    }
  }

  private async seedLegacyAdminIfEnabled(): Promise<void> {
    const seed = this.configService.get('seed', { infer: true });
    if (!seed.enabled) {
      return;
    }

    if (!seed.adminMobile || !seed.adminPassword) {
      this.logger.warn('Seed enabled but SEED_ADMIN_MOBILE or SEED_ADMIN_PASSWORD missing');
      return;
    }

    const existingByMobile = await this.usersService.findByMobile(seed.adminMobile);
    if (existingByMobile) {
      this.logger.warn(
        `[CMS Admin] Login at /admin/login — mobile: ${seed.adminMobile}`,
      );
      return;
    }

    if (seed.adminEmail) {
      const existingByEmail = await this.usersService.findByEmail(seed.adminEmail);
      if (existingByEmail) {
        await this.usersService.updateUser(existingByEmail.id, {
          mobile: seed.adminMobile,
          password: seed.adminPassword,
          displayName: seed.adminDisplayName,
          role: UserRole.Admin,
          isActive: true,
        });
        this.logger.warn(
          `[CMS Admin] Linked legacy email admin to mobile: ${seed.adminMobile}`,
        );
        return;
      }
    }

    await this.usersService.createUser({
      mobile: seed.adminMobile,
      password: seed.adminPassword,
      displayName: seed.adminDisplayName,
      role: UserRole.Admin,
      email: seed.adminEmail ?? null,
    });

    this.logger.warn(
      `[CMS Admin] Seeded admin — mobile: ${seed.adminMobile}`,
    );
  }
}
