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
import { PublicAdvertisementsController } from './public-advertisements.controller';
import { PublicMarketRatesController } from './public-market-rates.controller';
import { PublicTagsController } from './public-tags.controller';
import { PublicTaxonomyService } from './public-taxonomy.service';
import { StoriesModule } from '../stories/stories.module';
import { AdvertisementsModule } from '../advertisements/advertisements.module';
import { MarketModule } from '../market/market.module';
import { Story } from '../stories/entities/story.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Category, Tag, Story, Advertisement]),
    StoriesModule,
    AdvertisementsModule,
    MarketModule,
    ArticlesModule,
  ],
  controllers: [
    PublicArticlesController,
    PublicCategoriesController,
    PublicTagsController,
    PublicSearchController,
    PublicStoriesController,
    PublicAdvertisementsController,
    PublicMarketRatesController,
  ],
  providers: [PublicArticlesService, PublicTaxonomyService],
  exports: [PublicArticlesService],
})
export class PublicModule {}
