import { MigrationInterface, QueryRunner } from 'typeorm';

const PLACEHOLDER = '/images/placeholder-news.svg';

export class NormalizeArticleFeaturedImages1753786000000 implements MigrationInterface {
  name = 'NormalizeArticleFeaturedImages1753786000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "article_seo"
       SET "og_image_url" = $1
       WHERE "og_image_url" IS NULL
          OR BTRIM("og_image_url") = ''
          OR "og_image_url" ~ '^https?://'`,
      [PLACEHOLDER],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot restore original remote URLs.
    await queryRunner.query(
      `UPDATE "article_seo"
       SET "og_image_url" = NULL
       WHERE "og_image_url" = $1`,
      [PLACEHOLDER],
    );
  }
}
