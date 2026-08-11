import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameArticleBodyToContent1753542000000 implements MigrationInterface {
  name = 'RenameArticleBodyToContent1753542000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBody = await queryRunner.hasColumn('articles', 'body');
    const hasContent = await queryRunner.hasColumn('articles', 'content');

    if (hasBody && !hasContent) {
      await queryRunner.query(
        `ALTER TABLE "articles" RENAME COLUMN "body" TO "content"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBody = await queryRunner.hasColumn('articles', 'body');
    const hasContent = await queryRunner.hasColumn('articles', 'content');

    if (hasContent && !hasBody) {
      await queryRunner.query(
        `ALTER TABLE "articles" RENAME COLUMN "content" TO "body"`,
      );
    }
  }
}
