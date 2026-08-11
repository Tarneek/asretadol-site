import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArticleVideoFields1753787000000 implements MigrationInterface {
  name = 'AddArticleVideoFields1753787000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "has_video" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "video_url" character varying(2048)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "video_url"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "has_video"`);
  }
}
