import 'reflect-metadata';
import dataSource from '../database/data-source';
import { runPanelAdminsSeed } from './panel-admins-seed';

async function main(): Promise<void> {
  await dataSource.initialize();

  try {
    const results = await runPanelAdminsSeed(dataSource);
    console.log('Panel admin upsert completed:');
    for (const row of results) {
      console.log(`  ${row.mobile} — ${row.action}`);
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error('Panel admin seed failed:', error);
  process.exit(1);
});
