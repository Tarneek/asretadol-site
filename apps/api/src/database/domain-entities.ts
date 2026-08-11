import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { ArticleSeo } from '../modules/articles/entities/article-seo.entity';
import { Article } from '../modules/articles/entities/article.entity';
import { ArticleDailyViews } from '../modules/articles/entities/article-daily-views.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Story } from '../modules/stories/entities/story.entity';
import { Tag } from '../modules/tags/entities/tag.entity';
import { User } from '../modules/users/entities/user.entity';

export const domainEntities = [
  User,
  RefreshToken,
  Category,
  Tag,
  Story,
  Article,
  ArticleSeo,
  ArticleDailyViews,
];
