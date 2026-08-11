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
    `select column_name
     from information_schema.columns
     where table_name='articles'
       and column_name in ('hero','breaking','has_video','video_url')
     order by column_name`,
  );

  console.log('articles columns:', cols.rows);
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

