import { createHmac, randomBytes } from 'crypto';

const REFRESH_TOKEN_BYTES = 64;

export function generateOpaqueToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
}

export function hashOpaqueToken(token: string, pepper: string): string {
  return createHmac('sha256', pepper).update(token).digest('hex');
}
