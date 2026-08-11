import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArticleDailyViews1753785000000 implements MigrationInterface {
  name = 'AddArticleDailyViews1753785000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "article_daily_views" (
        "view_date" date NOT NULL,
        "views" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_article_daily_views" PRIMARY KEY ("view_date")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "article_daily_views"`);
  }
}
