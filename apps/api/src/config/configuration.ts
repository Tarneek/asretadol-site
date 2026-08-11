import { EnvironmentVariables } from './env.validation';

export type AppConfig = {
  nodeEnv: EnvironmentVariables['NODE_ENV'];
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  cors: {
    origins: string[];
  };
  throttle: {
    ttlMs: number;
    limit: number;
    authLimit: number;
  };
  trustProxy: boolean;
  seed: {
    enabled: boolean;
    adminEmail?: string;
    adminPassword?: string;
    adminDisplayName: string;
  };
};

function parseOrigins(raw?: string): string[] {
  if (!raw) {
    return ['http://localhost:3000'];
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function configuration(): AppConfig {
  const env = process.env as Record<string, string | undefined>;

  return {
    nodeEnv: env.NODE_ENV as AppConfig['nodeEnv'],
    port: Number(env.API_PORT),
    database: {
      host: env.DATABASE_HOST as string,
      port: Number(env.DATABASE_PORT),
      username: env.DATABASE_USER as string,
      password: env.DATABASE_PASSWORD as string,
      database: env.DATABASE_NAME as string,
    },
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET as string,
      accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN as string,
      refreshSecret: env.JWT_REFRESH_SECRET as string,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
    },
    cors: {
      origins: parseOrigins(env.CORS_ORIGINS),
    },
    throttle: {
      ttlMs: Number(env.THROTTLE_TTL_MS ?? 60_000),
      limit: Number(env.THROTTLE_LIMIT ?? 100),
      authLimit: Number(env.THROTTLE_AUTH_LIMIT ?? 20),
    },
    trustProxy: env.TRUST_PROXY === 'true' || env.TRUST_PROXY === '1',
    seed: {
      enabled:
        env.SEED_ADMIN_ENABLED === 'true' ||
        env.SEED_ADMIN_ENABLED === '1',
      adminEmail: env.SEED_ADMIN_EMAIL,
      adminPassword: env.SEED_ADMIN_PASSWORD,
      adminDisplayName: env.SEED_ADMIN_DISPLAY_NAME ?? 'Administrator',
    },
  };
}
