import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleViewAnalyticsService } from '../articles/article-view-analytics.service';
import { ArticlesModule } from '../articles/articles.module';
import { Article } from '../articles/entities/article.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { PublicArticlesController } from './public-articles.controller';
import { PublicArticlesService } from './public-articles.service';
import { PublicCategoriesController } from './public-categories.controller';
import { PublicSearchController } from './public-search.controller';
import { PublicStoriesController } from './public-stories.controller';
import { PublicTagsController } from './public-tags.controller';
import { PublicTaxonomyService } from './public-taxonomy.service';
import { StoriesModule } from '../stories/stories.module';
import { Story } from '../stories/entities/story.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Category, Tag, Story]), StoriesModule, ArticlesModule],
  controllers: [
    PublicArticlesController,
    PublicCategoriesController,
    PublicTagsController,
    PublicSearchController,
    PublicStoriesController,
  ],
  providers: [PublicArticlesService, PublicTaxonomyService],
  exports: [PublicArticlesService],
})
export class PublicModule {}
