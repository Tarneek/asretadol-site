import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { join } from 'path';
import { configuration } from './configuration';
import { validateEnv } from './env.validation';

const monorepoRoot = join(__dirname, '..', '..', '..', '..');

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(monorepoRoot, '.env'), join(__dirname, '..', '..', '.env')],
      load: [configuration],
      validate: validateEnv,
    }),
  ],
})
export class AppConfigModule {}
