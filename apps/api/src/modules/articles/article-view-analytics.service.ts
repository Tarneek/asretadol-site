import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleViewsChartDto } from './dto/article-views-chart.dto';
import { ArticleDailyViews } from './entities/article-daily-views.entity';

function isMissingDailyViewsTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('article_daily_views') && message.includes('does not exist');
}

function utcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

@Injectable()
export class ArticleViewAnalyticsService {
  private readonly logger = new Logger(ArticleViewAnalyticsService.name);

  constructor(
    @InjectRepository(ArticleDailyViews)
    private readonly dailyViewsRepository: Repository<ArticleDailyViews>,
  ) {}

  async recordArticleView(): Promise<void> {
    const viewDate = utcDateString(new Date());
    try {
      await this.dailyViewsRepository.query(
        `
      INSERT INTO "article_daily_views" ("view_date", "views")
      VALUES ($1, 1)
      ON CONFLICT ("view_date")
      DO UPDATE SET "views" = "article_daily_views"."views" + 1
      `,
        [viewDate],
      );
    } catch (error) {
      if (isMissingDailyViewsTableError(error)) {
        this.logger.warn(
          'article_daily_views table missing; run migrations to enable daily view analytics',
        );
        return;
      }
      throw error;
    }
  }

  buildEmptyChart(days: number): ArticleViewsChartDto {
    const clampedDays = Math.min(90, Math.max(7, days));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const start = addUtcDays(today, -(clampedDays - 1));
    const points: ArticleViewsChartDto['points'] = [];
    for (let i = 0; i < clampedDays; i += 1) {
      points.push({ date: utcDateString(addUtcDays(start, i)), views: 0 });
    }
    return { days: clampedDays, totalInRange: 0, points };
  }

  async getViewsChart(days = 14): Promise<ArticleViewsChartDto> {
    const clampedDays = Math.min(90, Math.max(7, days));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const start = addUtcDays(today, -(clampedDays - 1));
    const startKey = utcDateString(start);

    let rows: ArticleDailyViews[];
    try {
      rows = await this.dailyViewsRepository
        .createQueryBuilder('daily')
        .where('daily.viewDate >= :startKey', { startKey })
        .orderBy('daily.viewDate', 'ASC')
        .getMany();
    } catch (error) {
      if (isMissingDailyViewsTableError(error)) {
        this.logger.warn(
          'article_daily_views table missing; returning empty chart (run migrations)',
        );
        return this.buildEmptyChart(clampedDays);
      }
      throw error;
    }

    const byDate = new Map(
      rows.map((row) => {
        const key =
          typeof row.viewDate === 'string'
            ? row.viewDate.slice(0, 10)
            : utcDateString(new Date(row.viewDate));
        return [key, row.views] as const;
      }),
    );

    const points: ArticleViewsChartDto['points'] = [];
    let totalInRange = 0;

    for (let i = 0; i < clampedDays; i += 1) {
      const d = addUtcDays(start, i);
      const key = utcDateString(d);
      const views = byDate.get(key) ?? 0;
      totalInRange += views;
      points.push({ date: key, views });
    }

    return {
      days: clampedDays,
      totalInRange,
      points,
    };
  }
}
