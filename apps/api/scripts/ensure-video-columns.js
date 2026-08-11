require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { Client } = require('pg');

async function main() {
  const c = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });
  await c.connect();
  const cols = await c.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'articles' AND column_name IN ('has_video', 'video_url')`,
  );
  console.log('video columns:', cols.rows);
  if (cols.rows.length < 2) {
    console.log('Applying AddArticleVideoFields migration SQL...');
    await c.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "has_video" boolean NOT NULL DEFAULT false`,
    );
    await c.query(
      `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "video_url" character varying(2048)`,
    );
    await c.query(
      `INSERT INTO "typeorm_migrations" ("timestamp", "name")
       SELECT 1753787000000, 'AddArticleVideoFields1753787000000'
       WHERE NOT EXISTS (
         SELECT 1 FROM "typeorm_migrations" WHERE "name" = 'AddArticleVideoFields1753787000000'
       )`,
    );
    console.log('Done.');
  }
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
