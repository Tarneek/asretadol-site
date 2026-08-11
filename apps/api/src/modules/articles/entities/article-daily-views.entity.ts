import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Daily rollup of article page views (UTC calendar date). */
@Entity('article_daily_views')
export class ArticleDailyViews {
  @PrimaryColumn({ name: 'view_date', type: 'date' })
  viewDate!: string;

  @Column({ type: 'integer', default: 0 })
  views!: number;
}
