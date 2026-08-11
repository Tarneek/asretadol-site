import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { domainEntities } from './domain-entities';

/**
 * Loads env for CLI migrations (dev TS and prod JS).
 * Prefer process env already injected by the platform in production.
 */
const monorepoRoot = join(__dirname, '..', '..', '..', '..');
const apiRoot = join(__dirname, '..', '..');

loadEnv({ path: join(monorepoRoot, '.env') });
loadEnv({ path: join(apiRoot, '.env') });

const host = process.env.DATABASE_HOST;
const port = Number(process.env.DATABASE_PORT);
const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;

if (!host || !username || !password || !database || Number.isNaN(port)) {
  throw new Error(
    'Missing database env vars. Copy .env.example to .env at the monorepo root, or inject DATABASE_* in the environment.',
  );
}

export default new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: domainEntities,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
});
