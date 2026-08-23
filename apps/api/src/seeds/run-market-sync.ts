import 'reflect-metadata';
import dataSource from '../database/data-source';
import { MarketRate } from '../modules/market/entities/market-rate.entity';
import { MarketRatesService } from '../modules/market/market-rates.service';
import { MarketSyncService } from '../modules/market/market-sync.service';
import { TgjuMarketProvider } from '../modules/market/providers/tgju-market.provider';

async function main(): Promise<void> {
  await dataSource.initialize();

  try {
    const marketRatesRepository = dataSource.getRepository(MarketRate);
    const marketRatesService = new MarketRatesService(marketRatesRepository);
    const tgjuProvider = new TgjuMarketProvider();
    const syncService = new MarketSyncService(marketRatesService, tgjuProvider);

    await syncService.syncAll();

    const rates = await marketRatesService.findAllPublic();
    console.log(`Manual TGJU market sync completed (${rates.length} items):`);
    for (const rate of rates) {
      console.log(
        `  ${rate.title} (${rate.key}): ${rate.currentPrice} | ${rate.changeDisplay} | ${rate.trend}`,
      );
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error('Manual market sync failed:', error);
  process.exit(1);
});
