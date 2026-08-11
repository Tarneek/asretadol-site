import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStories1753783000000 implements MigrationInterface {
  name = 'AddStories1753783000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "story_media_type" AS ENUM ('image', 'video')`);
    await queryRunner.query(`
      CREATE TABLE "stories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(255) NOT NULL,
        "media_url" character varying(2048) NOT NULL,
        "media_type" "story_media_type" NOT NULL,
        "link" character varying(2048),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stories_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_stories_is_active_created_at"
      ON "stories" ("is_active", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_stories_is_active_created_at"`);
    await queryRunner.query(`DROP TABLE "stories"`);
    await queryRunner.query(`DROP TYPE "story_media_type"`);
  }
}
