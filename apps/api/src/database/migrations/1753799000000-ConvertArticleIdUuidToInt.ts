import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertArticleIdUuidToInt1753799000000 implements MigrationInterface {
  name = 'ConvertArticleIdUuidToInt1753799000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // NOTE:
    // - This migration assumes `articles.id` is UUID and only the related tables
    //   `article_seo`, `article_categories`, `article_tags` reference it.
    // - It generates new INT ids (mapping from UUID -> INT) and rewires PK/FK.
    // - Existing UUID ids are dropped.

    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "articles_id_int_seq"`);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD COLUMN IF NOT EXISTS "id_int" integer
    `);

    // Fill missing values only (safe if you re-run).
    await queryRunner.query(`
      UPDATE "articles"
      SET "id_int" = nextval('articles_id_int_seq')
      WHERE "id_int" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ALTER COLUMN "id_int" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "article_seo"
      ADD COLUMN IF NOT EXISTS "article_id_int" integer
    `);

    await queryRunner.query(`
      UPDATE "article_seo" s
      SET "article_id_int" = a."id_int"
      FROM "articles" a
      WHERE s."article_id" = a."id"
        AND s."article_id_int" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "article_categories"
      ADD COLUMN IF NOT EXISTS "article_id_int" integer
    `);

    await queryRunner.query(`
      UPDATE "article_categories" ac
      SET "article_id_int" = a."id_int"
      FROM "articles" a
      WHERE ac."article_id" = a."id"
        AND ac."article_id_int" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "article_tags"
      ADD COLUMN IF NOT EXISTS "article_id_int" integer
    `);

    await queryRunner.query(`
      UPDATE "article_tags" at
      SET "article_id_int" = a."id_int"
      FROM "articles" a
      WHERE at."article_id" = a."id"
        AND at."article_id_int" IS NULL
    `);

    // Drop FKs that reference articles(id) (UUID).
    await queryRunner.query(
      `ALTER TABLE "article_seo" DROP CONSTRAINT IF EXISTS "FK_article_seo_article_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_categories" DROP CONSTRAINT IF EXISTS "FK_article_categories_article_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" DROP CONSTRAINT IF EXISTS "FK_article_tags_article_id"`,
    );

    // Drop PKs that depend on the old UUID columns.
    await queryRunner.query(`ALTER TABLE "article_seo" DROP CONSTRAINT IF EXISTS "PK_article_seo_article_id"`);
    await queryRunner.query(
      `ALTER TABLE "article_categories" DROP CONSTRAINT IF EXISTS "PK_article_categories"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" DROP CONSTRAINT IF EXISTS "PK_article_tags"`,
    );
    await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "PK_articles_id"`);

    // Replace UUID columns with INT columns.
    await queryRunner.query(`ALTER TABLE "article_seo" DROP COLUMN IF EXISTS "article_id"`);
    await queryRunner.query(
      `ALTER TABLE "article_seo" RENAME COLUMN "article_id_int" TO "article_id"`,
    );

    await queryRunner.query(`ALTER TABLE "article_categories" DROP COLUMN IF EXISTS "article_id"`);
    await queryRunner.query(
      `ALTER TABLE "article_categories" RENAME COLUMN "article_id_int" TO "article_id"`,
    );

    await queryRunner.query(`ALTER TABLE "article_tags" DROP COLUMN IF EXISTS "article_id"`);
    await queryRunner.query(
      `ALTER TABLE "article_tags" RENAME COLUMN "article_id_int" TO "article_id"`,
    );

    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN IF EXISTS "id"`);
    await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "id_int" TO "id"`);
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "id" SET DEFAULT nextval('articles_id_int_seq')`,
    );
    await queryRunner.query(`ALTER SEQUENCE "articles_id_int_seq" OWNED BY "articles"."id"`);

    // Recreate PKs.
    await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "PK_articles_id" PRIMARY KEY ("id")`);
    await queryRunner.query(
      `ALTER TABLE "article_seo" ADD CONSTRAINT "PK_article_seo_article_id" PRIMARY KEY ("article_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_categories" ADD CONSTRAINT "PK_article_categories" PRIMARY KEY ("article_id", "category_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "PK_article_tags" PRIMARY KEY ("article_id", "tag_id")`,
    );

    // Recreate FKs.
    await queryRunner.query(`
      ALTER TABLE "article_seo"
      ADD CONSTRAINT "FK_article_seo_article_id"
      FOREIGN KEY ("article_id") REFERENCES "articles"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "article_categories"
      ADD CONSTRAINT "FK_article_categories_article_id"
      FOREIGN KEY ("article_id") REFERENCES "articles"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "article_tags"
      ADD CONSTRAINT "FK_article_tags_article_id"
      FOREIGN KEY ("article_id") REFERENCES "articles"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverting UUID -> INT conversion is non-trivial (data mapping lost).
    // We intentionally leave `down` empty to prevent accidental misuse.
    //
    // If you need rollback, restore from DB backup.
  }
}

