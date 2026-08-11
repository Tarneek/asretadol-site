import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Story } from '../stories/entities/story.entity';
import { ArticleViewAnalyticsService } from './article-view-analytics.service';
import { ArticleMediaService } from './article-media.service';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticleDailyViews } from './entities/article-daily-views.entity';
import { ArticleSeo } from './entities/article-seo.entity';
import { Article } from './entities/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleSeo, ArticleDailyViews, Category, Tag, Story]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleViewAnalyticsService, ArticleMediaService],
  exports: [ArticlesService, ArticleViewAnalyticsService, TypeOrmModule],
})
export class ArticlesModule {}
