import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_MARKET_RATES } from './market-defaults.data';
import { MarketRate } from './entities/market-rate.entity';
import type { MarketRateKey } from './enums/market-rate-key.enum';
import { formatTgjuChangeDisplay } from './market-format.util';

export type PublicMarketRateDto = {
  key: MarketRateKey;
  title: string;
  currentPrice: string;
  changeValue: string;
  changePercent: string;
  changeDisplay: string;
  trend: 'up' | 'down';
  lastUpdated: string;
};

export type MarketRateUpsert = {
  key: MarketRateKey;
  title: string;
  currentPrice: string;
  changeValue: string;
  changePercent: string;
  trend: 'up' | 'down';
  sortOrder: number;
};

@Injectable()
export class MarketRatesService {
  private cache: PublicMarketRateDto[] | null = null;

  constructor(
    @InjectRepository(MarketRate)
    private readonly marketRatesRepository: Repository<MarketRate>,
  ) {}

  async ensureSeeded(): Promise<void> {
    const count = await this.marketRatesRepository.count();
    if (count > 0) {
      return;
    }

    await this.marketRatesRepository.save(
      DEFAULT_MARKET_RATES.map((seed) => ({
        key: seed.key,
        title: seed.title,
        currentPrice: seed.currentPrice,
        changeValue: seed.changeValue,
        changePercent: seed.changePercent,
        trend: seed.trend,
        sortOrder: seed.sortOrder,
      })),
    );
    this.invalidateCache();
  }

  async findAllRaw(): Promise<MarketRate[]> {
    return this.marketRatesRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async findAllPublic(): Promise<PublicMarketRateDto[]> {
    if (this.cache) {
      return this.cache;
    }

    await this.ensureSeeded();

    const rows = await this.findAllRaw();
    this.cache = rows.map((row) => this.toPublicDto(row));
    return this.cache;
  }

  async upsertMany(rates: MarketRateUpsert[]): Promise<void> {
    if (rates.length === 0) {
      return;
    }

    await this.marketRatesRepository.save(rates);
    this.invalidateCache();
  }

  invalidateCache(): void {
    this.cache = null;
  }

  private toPublicDto(row: MarketRate): PublicMarketRateDto {
    return {
      key: row.key,
      title: row.title,
      currentPrice: row.currentPrice,
      changeValue: row.changeValue,
      changePercent: row.changePercent,
      changeDisplay: formatTgjuChangeDisplay(row.changeValue, row.changePercent),
      trend: row.trend,
      lastUpdated: row.lastUpdated.toISOString(),
    };
  }
}
