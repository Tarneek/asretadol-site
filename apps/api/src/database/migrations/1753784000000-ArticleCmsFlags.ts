import { MigrationInterface, QueryRunner } from 'typeorm';

export class ArticleCmsFlags1753784000000 implements MigrationInterface {
  name = 'ArticleCmsFlags1753784000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "article_status" ADD VALUE 'scheduled'`);

    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "breaking" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "hero" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "views_count" integer NOT NULL DEFAULT 0`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_articles_hero" ON "articles" ("hero")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_articles_breaking" ON "articles" ("breaking")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_articles_breaking"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_articles_hero"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "views_count"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "hero"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "breaking"`);
    // PostgreSQL does not support removing enum values without recreating the type.
  }
}
