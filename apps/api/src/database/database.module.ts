import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../config/configuration';
import { NodeEnv } from '../config/env.validation';
import { domainEntities } from './domain-entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const db = configService.get('database', { infer: true });
        const nodeEnv = configService.get('nodeEnv', { infer: true });

        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          entities: domainEntities,
          autoLoadEntities: true,
          synchronize: false,
          migrationsRun: false,
          migrationsTableName: 'typeorm_migrations',
          logging: nodeEnv === NodeEnv.Development,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
