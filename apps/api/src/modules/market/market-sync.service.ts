import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_MARKET_RATES } from './market-defaults.data';
import { MarketRateKey } from './enums/market-rate-key.enum';
import type { ParsedMarketQuote } from './market-format.util';
import { isValidMarketQuote } from './market-quote.validation';
import { MarketRatesService, type MarketRateUpsert } from './market-rates.service';
import { TgjuMarketProvider } from './providers/tgju-market.provider';

@Injectable()
export class MarketSyncService {
  private readonly logger = new Logger(MarketSyncService.name);
  private syncInFlight: Promise<void> | null = null;

  constructor(
    private readonly marketRatesService: MarketRatesService,
    private readonly tgjuProvider: TgjuMarketProvider,
  ) {}

  async syncAll(): Promise<void> {
    if (this.syncInFlight) {
      return this.syncInFlight;
    }

    this.syncInFlight = this.runSync().finally(() => {
      this.syncInFlight = null;
    });

    return this.syncInFlight;
  }

  private pickQuote(
    key: MarketRateKey,
    tgjuQuotes: Partial<Record<MarketRateKey, ParsedMarketQuote>>,
  ): ParsedMarketQuote | null {
    const quote = tgjuQuotes[key];
    if (quote && isValidMarketQuote(key, quote)) {
      return quote;
    }
    return null;
  }

  private async runSync(): Promise<void> {
    await this.marketRatesService.ensureSeeded();

    const tgjuQuotes = await this.tgjuProvider.fetchQuotes();

    const existing = await this.marketRatesService.findAllRaw();
    const existingByKey = new Map(existing.map((row) => [row.key, row]));

    let updatedCount = 0;

    const updates: MarketRateUpsert[] = DEFAULT_MARKET_RATES.map((seed) => {
      const quote = this.pickQuote(seed.key, tgjuQuotes);
      const current = existingByKey.get(seed.key);

      if (quote) {
        updatedCount += 1;
        return {
          key: seed.key,
          title: seed.title,
          currentPrice: quote.currentPrice,
          changeValue: quote.changeValue,
          changePercent: quote.changePercent,
          trend: quote.trend,
          sortOrder: seed.sortOrder,
        };
      }

      if (current) {
        return {
          key: current.key,
          title: seed.title,
          currentPrice: current.currentPrice,
          changeValue: current.changeValue,
          changePercent: current.changePercent,
          trend: current.trend,
          sortOrder: seed.sortOrder,
        };
      }

      return {
        key: seed.key,
        title: seed.title,
        currentPrice: seed.currentPrice,
        changeValue: seed.changeValue,
        changePercent: seed.changePercent,
        trend: seed.trend,
        sortOrder: seed.sortOrder,
      };
    });

    await this.marketRatesService.upsertMany(updates);
    this.logger.log(
      `Market rates synced from TGJU (${updatedCount}/${DEFAULT_MARKET_RATES.length} live quotes)`,
    );
  }
}
