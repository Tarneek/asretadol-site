import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserMobile1753900000000 implements MigrationInterface {
  name = 'AddUserMobile1753900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mobile" character varying(11)`,
    );

    // Legacy rows without mobile get a unique placeholder in the 0998xxxxxxx range.
    await queryRunner.query(`
      WITH numbered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
        FROM users
        WHERE mobile IS NULL OR btrim(mobile) = ''
      )
      UPDATE users u
      SET mobile = '0998' || LPAD(numbered.rn::text, 7, '0')
      FROM numbered
      WHERE u.id = numbered.id
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'mobile' AND is_nullable = 'YES'
        ) THEN
          ALTER TABLE "users" ALTER COLUMN "mobile" SET NOT NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_mobile" ON "users" ("mobile")`,
    );

    // Email becomes optional (login is mobile-based). Keep uniqueness when present.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_users_email'
        ) THEN
          ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email" ON "users" ("email") WHERE "email" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_users_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_users_mobile"`);

    await queryRunner.query(`
      UPDATE "users"
      SET "email" = COALESCE("email", "mobile" || '@users.local')
      WHERE "email" IS NULL
    `);

    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mobile"`);
  }
}
