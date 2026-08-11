import type { StringValue } from 'ms';
import type { JwtSignOptions } from '@nestjs/jwt';

/** JWT `expiresIn` values from config (e.g. `15m`, `7d`). */
export type JwtExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

export function jwtExpiresIn(value: string): JwtExpiresIn {
  return value as JwtExpiresIn;
}

export function msDuration(value: string): StringValue {
  return value as StringValue;
}
