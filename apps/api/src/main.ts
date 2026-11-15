import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { resolve } from 'node:path';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { NodeEnv } from './config/env.validation';
import {
  ensureBlogUploadDirectories,
} from './modules/articles/article-upload.paths';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === NodeEnv.Production
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService<AppConfig, true>);
  const nodeEnv = configService.get('nodeEnv', { infer: true });
  const port = configService.get('port', { infer: true });
  const corsOrigins = configService.get('cors', { infer: true }).origins;
  const trustProxy = configService.get('trustProxy', { infer: true });

  if (trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === NodeEnv.Production,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix('api');

  // Public JSON feeds must not be cached by browsers or intermediate proxies.
  // Next.js Data Cache is the intentional caching layer (tags + ISR).
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/public') || req.path.startsWith('/public')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }
    next();
  });

  const blogRoot = ensureBlogUploadDirectories();
  app.useStaticAssets(resolve(blogRoot, '..'), {
    prefix: '/uploads/',
    // Uploads use unique filenames; allow short CDN/browser cache without immutable.
    maxAge: '7d',
    setHeaders: (res: Response) => {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    },
  });

  // Rich article HTML and large JSON payloads (default ~100kb is too small).
  app.useBodyParser('json', { limit: '5mb' });
  app.useBodyParser('urlencoded', { limit: '5mb', extended: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false, value: false },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port);
}

bootstrap();
