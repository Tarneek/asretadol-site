import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { MarketRateKey } from '../enums/market-rate-key.enum';

@Entity('market_rates')
export class MarketRate {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  key!: MarketRateKey;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ name: 'current_price', type: 'varchar', length: 64 })
  currentPrice!: string;

  @Column({ name: 'change_value', type: 'varchar', length: 32 })
  changeValue!: string;

  @Column({ name: 'change_percent', type: 'varchar', length: 16 })
  changePercent!: string;

  @Column({ type: 'varchar', length: 8 })
  trend!: 'up' | 'down';

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @UpdateDateColumn({ name: 'last_updated', type: 'timestamptz' })
  lastUpdated!: Date;
}
