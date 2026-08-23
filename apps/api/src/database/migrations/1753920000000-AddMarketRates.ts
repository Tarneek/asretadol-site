import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMarketRates1753920000000 implements MigrationInterface {
  name = 'AddMarketRates1753920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "market_rates" (
        "key" character varying(32) NOT NULL,
        "title" character varying(120) NOT NULL,
        "current_price" character varying(64) NOT NULL,
        "change_value" character varying(32) NOT NULL,
        "change_percent" character varying(16) NOT NULL,
        "trend" character varying(8) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "last_updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_market_rates_key" PRIMARY KEY ("key"),
        CONSTRAINT "CHK_market_rates_trend" CHECK ("trend" IN ('up', 'down'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_market_rates_sort_order"
      ON "market_rates" ("sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_market_rates_sort_order"`);
    await queryRunner.query(`DROP TABLE "market_rates"`);
  }
}
