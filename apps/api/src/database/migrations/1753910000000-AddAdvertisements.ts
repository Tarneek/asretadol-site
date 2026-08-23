import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvertisements1753910000000 implements MigrationInterface {
  name = 'AddAdvertisements1753910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "ad_placement" AS ENUM ('ad-slot', 'ad-banner')`);
    await queryRunner.query(`
      CREATE TABLE "advertisements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(255) NOT NULL,
        "image_url" character varying(2048) NOT NULL,
        "link_url" character varying(2048) NOT NULL,
        "placement" "ad_placement" NOT NULL,
        "slot_index" smallint NOT NULL DEFAULT 0,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "rotation_enabled" boolean NOT NULL DEFAULT true,
        "rotation_interval_seconds" integer NOT NULL DEFAULT 8,
        "starts_at" TIMESTAMP WITH TIME ZONE,
        "ends_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_advertisements_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_advertisements_slot_index" CHECK ("slot_index" >= 0 AND "slot_index" <= 1)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_advertisements_placement_slot_active"
      ON "advertisements" ("placement", "slot_index", "is_active", "sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_advertisements_placement_slot_active"`);
    await queryRunner.query(`DROP TABLE "advertisements"`);
    await queryRunner.query(`DROP TYPE "ad_placement"`);
  }
}
