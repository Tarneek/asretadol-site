import 'reflect-metadata';
import dataSource from '../database/data-source';
import { ArticleStatus } from '../common/enums/article-status.enum';
import { demoArticles } from './demo/demo-content.data';
import { runDemoSeed } from './demo-seed';

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.error('Demo seed cannot run when NODE_ENV=production.');
    process.exit(1);
  }

  const force =
    process.env.SEED_DEMO_FORCE === '1' || process.env.SEED_DEMO_FORCE === 'true';

  await dataSource.initialize();

  try {
    const result = await runDemoSeed(dataSource, {
      force,
      authorPassword: process.env.SEED_DEMO_AUTHOR_PASSWORD,
    });

    if (result.skipped) {
      console.log('Demo seed skipped.');
      return;
    }

    const published = demoArticles.filter((a) => a.status === ArticleStatus.Published);
    const featured = published.filter((a) => a.featured);
    const drafts = demoArticles.filter((a) => a.status === ArticleStatus.Draft);
    const archived = demoArticles.filter((a) => a.status === ArticleStatus.Archived);

    console.log('Demo seed completed:');
    console.log(`  Categories: ${result.categories}`);
    console.log(`  Tags: ${result.tags}`);
    console.log(`  New users: ${result.usersCreated}`);
    console.log(`  Articles: ${result.articles}`);
    console.log(`    published: ${published.length} (featured: ${featured.length})`);
    console.log(`    draft: ${drafts.length}`);
    console.log(`    archived: ${archived.length}`);
    console.log('');
    console.log('Homepage section slugs:');
    console.log('  /category/iranian-economy');
    console.log('  /category/world-economy');
    console.log('  /tag/analysis');
    console.log('');
    console.log('Demo logins (if newly created):');
    console.log('  editor@news.local / sara.author@news.local / ali.author@news.local');
    console.log('  Password: SEED_DEMO_AUTHOR_PASSWORD or SEED_ADMIN_PASSWORD');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error('Demo seed failed:', error);
  process.exit(1);
});
