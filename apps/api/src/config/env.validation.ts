import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
  validateSync,
  ValidateIf,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

function parseCsv(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  API_PORT: number = 3001;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  DATABASE_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME!: string;

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN!: string;

  /** Comma-separated allowed browser origins */
  @IsOptional()
  @Transform(({ value }) => parseCsv(value).join(','))
  @IsString()
  CORS_ORIGINS?: string = 'http://localhost:3000';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_TTL_MS?: number = 60_000;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_AUTH_LIMIT?: number = 20;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  TRUST_PROXY?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  SEED_ADMIN_ENABLED?: boolean = false;

  @ValidateIf((env) => env.SEED_ADMIN_ENABLED === true || env.SEED_ADMIN_ENABLED === 'true')
  @IsEmail()
  SEED_ADMIN_EMAIL?: string;

  @ValidateIf((env) => env.SEED_ADMIN_ENABLED === true || env.SEED_ADMIN_ENABLED === 'true')
  @IsString()
  @MinLength(12)
  SEED_ADMIN_PASSWORD?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  SEED_ADMIN_DISPLAY_NAME?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    const messages = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .join('\n');
    throw new Error(`Environment validation failed:\n${messages}`);
  }

  if (
    validated.NODE_ENV === NodeEnv.Production &&
    (validated.JWT_ACCESS_SECRET.includes('change-me') ||
      validated.JWT_REFRESH_SECRET.includes('change-me'))
  ) {
    throw new Error(
      'Environment validation failed:\nJWT secrets must not use placeholder values in production',
    );
  }

  if (validated.NODE_ENV === NodeEnv.Production && validated.SEED_ADMIN_ENABLED) {
    throw new Error(
      'Environment validation failed:\nSEED_ADMIN_ENABLED must be false in production',
    );
  }

  return validated;
}
