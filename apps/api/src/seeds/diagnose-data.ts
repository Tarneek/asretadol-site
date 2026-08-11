import 'reflect-metadata';
import { ArticleStatus } from '../common/enums/article-status.enum';
import dataSource from '../database/data-source';
import { Article } from '../modules/articles/entities/article.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Tag } from '../modules/tags/entities/tag.entity';

type Check = { name: string; ok: boolean; detail: string };

async function main(): Promise<void> {
  const checks: Check[] = [];
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(
    /\/$/,
    '',
  );

  console.log('=== News platform data diagnosis ===\n');
  console.log(`API base (from env / default): ${apiBase}`);
  console.log(
    `DB: ${process.env.DATABASE_USER}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
  );
  console.log('');

  // --- Database ---
  try {
    await dataSource.initialize();
    checks.push({ name: 'PostgreSQL connection', ok: true, detail: 'Connected' });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message || (error as NodeJS.ErrnoException).code || error.name
        : String(error);
    const cause =
      error instanceof Error && 'cause' in error && error.cause instanceof Error
        ? error.cause.message || (error.cause as NodeJS.ErrnoException).code
        : undefined;
    checks.push({
      name: 'PostgreSQL connection',
      ok: false,
      detail: `FAILED: ${[message, cause].filter(Boolean).join(' — ')}. Start Postgres: docker compose up -d`,
    });
    printChecks(checks);
    console.error('\nCannot continue without a database.');
    console.error('Nothing to count yet: categories/tags/articles are unknown until Postgres is up.');
    console.error('Public API was not probed (Nest needs the same database).');
    process.exit(1);
  }

  try {
    const categoriesRepo = dataSource.getRepository(Category);
    const tagsRepo = dataSource.getRepository(Tag);
    const articlesRepo = dataSource.getRepository(Article);

    const categoryCount = await categoriesRepo.count();
    const tagCount = await tagsRepo.count();
    const publishedCount = await articlesRepo.count({
      where: { status: ArticleStatus.Published },
    });
    const draftCount = await articlesRepo.count({ where: { status: ArticleStatus.Draft } });
    const archivedCount = await articlesRepo.count({
      where: { status: ArticleStatus.Archived },
    });
    const featuredCount = await articlesRepo.count({
      where: { status: ArticleStatus.Published, featured: true },
    });
    const publishedWithDate = await articlesRepo
      .createQueryBuilder('article')
      .where('article.status = :status', { status: ArticleStatus.Published })
      .andWhere('article.published_at IS NOT NULL')
      .getCount();

    const iran = await categoriesRepo.findOne({ where: { slug: 'iranian-economy' } });
    const world = await categoriesRepo.findOne({ where: { slug: 'world-economy' } });
    const analysisTag = await tagsRepo.findOne({ where: { slug: 'analysis' } });

    console.log('--- Database counts ---');
    console.log(`  categories: ${categoryCount}`);
    console.log(`  tags: ${tagCount}`);
    console.log(`  articles published: ${publishedCount}`);
    console.log(`  articles published with published_at: ${publishedWithDate}`);
    console.log(`  articles featured: ${featuredCount}`);
    console.log(`  articles draft: ${draftCount}`);
    console.log(`  articles archived: ${archivedCount}`);
    console.log(`  category iranian-economy: ${iran ? 'YES' : 'MISSING'}`);
    console.log(`  category world-economy: ${world ? 'YES' : 'MISSING'}`);
    console.log(`  tag analysis: ${analysisTag ? 'YES' : 'MISSING'}`);

    const samplePublished = await articlesRepo.find({
      where: { status: ArticleStatus.Published },
      select: ['slug', 'title', 'publishedAt', 'featured'],
      order: { publishedAt: 'DESC' },
      take: 5,
    });
    console.log('  sample published slugs:');
    if (samplePublished.length === 0) {
      console.log('    (none)');
    } else {
      for (const row of samplePublished) {
        console.log(
          `    - ${row.slug} | featured=${row.featured} | published_at=${row.publishedAt?.toISOString() ?? 'NULL'}`,
        );
      }
    }
    console.log('');

    checks.push({
      name: 'Migrations / tables readable',
      ok: true,
      detail: 'categories, tags, articles queries succeeded',
    });
    checks.push({
      name: 'Published articles exist',
      ok: publishedWithDate > 0,
      detail:
        publishedWithDate > 0
          ? `${publishedWithDate} published rows with published_at`
          : 'None — run: pnpm seed:demo',
    });
    checks.push({
      name: 'Homepage category slugs',
      ok: Boolean(iran && world),
      detail:
        iran && world
          ? 'iranian-economy + world-economy present'
          : 'Missing homepage categories — run: pnpm seed:demo',
    });

    // --- HTTP public API ---
    const endpoints = [
      '/health',
      '/public/articles/latest?limit=3',
      '/public/articles/featured?limit=3',
      '/public/categories',
      '/public/categories/iranian-economy/articles?limit=3',
      '/public/tags/analysis/articles?limit=3',
    ];

    console.log('--- Public API probes ---');
    for (const path of endpoints) {
      const url = `${apiBase}${path}`;
      try {
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        });
        const text = await response.text();
        let summary = text.slice(0, 180).replace(/\s+/g, ' ');
        if (path.includes('/latest') || path.includes('/featured') || path.includes('/articles')) {
          try {
            const json = JSON.parse(text) as { data?: unknown[]; meta?: { total?: number } };
            summary = `data=${json.data?.length ?? '?'} total=${json.meta?.total ?? '?'}`;
          } catch {
            /* keep raw */
          }
        }
        if (path === '/public/categories' || path === '/public/tags') {
          try {
            const json = JSON.parse(text) as unknown[];
            summary = `items=${Array.isArray(json) ? json.length : '?'}`;
          } catch {
            /* keep raw */
          }
        }
        console.log(`  ${response.status} ${path} → ${summary}`);
        checks.push({
          name: `API ${path}`,
          ok: response.ok,
          detail: response.ok ? summary : text.slice(0, 120),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`  FAIL ${path} → ${message}`);
        checks.push({
          name: `API ${path}`,
          ok: false,
          detail: `${message}. Is the API running? pnpm dev:api`,
        });
      }
    }
  } finally {
    await dataSource.destroy();
  }

  printChecks(checks);
  const failed = checks.filter((c) => !c.ok);
  process.exit(failed.length === 0 ? 0 : 1);
}

function printChecks(checks: Check[]): void {
  console.log('\n--- Summary ---');
  for (const check of checks) {
    console.log(`${check.ok ? 'OK  ' : 'FAIL'} ${check.name}: ${check.detail}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
