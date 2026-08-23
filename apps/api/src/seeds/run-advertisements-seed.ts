import 'reflect-metadata';
import dataSource from '../database/data-source';
import { runAdvertisementsSeed } from './advertisements-seed';

async function main(): Promise<void> {
  await dataSource.initialize();

  try {
    const results = await runAdvertisementsSeed(dataSource);
    console.log('Advertisement seed completed:');
    for (const row of results) {
      console.log(`  [${row.action}] ${row.title} → ${row.imageUrl}`);
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error('Advertisement seed failed:', error);
  process.exit(1);
});
