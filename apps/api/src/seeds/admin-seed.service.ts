import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../common/enums/user-role.enum';
import { AppConfig } from '../config/configuration';
import { UsersService } from '../modules/users/users.service';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    const seed = this.configService.get('seed', { infer: true });
    if (!seed.enabled) {
      return;
    }

    if (!seed.adminEmail || !seed.adminPassword) {
      this.logger.warn('Seed enabled but SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD missing');
      return;
    }

    const existing = await this.usersService.findByEmail(seed.adminEmail);
    if (existing) {
      this.logger.warn(
        `[CMS Admin] Login at /admin/login — email: ${seed.adminEmail} | password: ${seed.adminPassword}`,
      );
      return;
    }

    await this.usersService.createUser({
      email: seed.adminEmail,
      password: seed.adminPassword,
      displayName: seed.adminDisplayName,
      role: UserRole.Admin,
    });

    this.logger.warn(
      `[CMS Admin] Seeded admin — email: ${seed.adminEmail} | password: ${seed.adminPassword}`,
    );
  }
}
