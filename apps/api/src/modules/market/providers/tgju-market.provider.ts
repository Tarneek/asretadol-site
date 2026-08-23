import { Injectable, Logger } from '@nestjs/common';
import { MarketRateKey } from '../enums/market-rate-key.enum';
import type { ParsedMarketQuote } from '../market-format.util';
import { isValidMarketQuote } from '../market-quote.validation';
import { quoteFromTgjuRow } from '../market-format.util';
import { TGJU_MARKET_API_BASE, TGJU_MARKET_INDICATORS } from '../market-tgju-sources.data';

type TgjuResponse = {
  data?: string[][] | Record<string, string[][]>;
};

@Injectable()
export class TgjuMarketProvider {
  private readonly logger = new Logger(TgjuMarketProvider.name);
  private readonly baseUrl = TGJU_MARKET_API_BASE;

  async fetchQuotes(): Promise<Partial<Record<MarketRateKey, ParsedMarketQuote>>> {
    const entries = Object.entries(TGJU_MARKET_INDICATORS);
    const results: Partial<Record<MarketRateKey, ParsedMarketQuote>> = {};

    await Promise.all(
      entries.map(async ([indicator, key]) => {
        try {
          const quote = await this.fetchIndicator(indicator);
          if (quote && isValidMarketQuote(key, quote)) {
            results[key] = quote;
          } else if (quote) {
            this.logger.warn(`TGJU quote rejected for ${indicator} (implausible price: ${quote.currentPrice})`);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(`TGJU fetch failed for ${indicator}: ${message}`);
        }
      }),
    );

    return results;
  }

  private async fetchIndicator(indicator: string): Promise<ParsedMarketQuote | null> {
    const response = await fetch(`${this.baseUrl}/${indicator}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'NiraNewsPlatform/1.0',
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = (await response.json()) as TgjuResponse;
    const rows = Array.isArray(payload.data)
      ? payload.data
      : payload.data?.[indicator];

    if (!rows?.length) {
      throw new Error('Empty TGJU payload');
    }

    return quoteFromTgjuRow(rows[0]!);
  }
}
