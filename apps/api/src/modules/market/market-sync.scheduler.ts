import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketSyncService } from './market-sync.service';

@Injectable()
export class MarketSyncScheduler implements OnModuleInit {
  private readonly logger = new Logger(MarketSyncScheduler.name);

  constructor(private readonly marketSyncService: MarketSyncService) {}

  onModuleInit(): void {
    void this.marketSyncService.syncAll().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Initial market sync failed: ${message}`);
    });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron(): void {
    void this.marketSyncService.syncAll().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Scheduled market sync failed: ${message}`);
    });
  }
}
