import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketRate } from './entities/market-rate.entity';
import { MarketRatesService } from './market-rates.service';
import { MarketSyncScheduler } from './market-sync.scheduler';
import { MarketSyncService } from './market-sync.service';
import { TgjuMarketProvider } from './providers/tgju-market.provider';

@Module({
  imports: [TypeOrmModule.forFeature([MarketRate])],
  providers: [
    MarketRatesService,
    MarketSyncService,
    MarketSyncScheduler,
    TgjuMarketProvider,
  ],
  exports: [MarketRatesService, MarketSyncService],
})
export class MarketModule {}
