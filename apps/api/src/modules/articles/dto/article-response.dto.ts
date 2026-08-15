import { ArticleStatus } from '../../../common/enums/article-status.enum';
import { UserRole } from '../../../common/enums/user-role.enum';

export class ArticleAuthorDto {
  id!: string;
  email!: string | null;
  displayName!: string;
  role!: UserRole;
}

export class ArticleCategorySummaryDto {
  id!: string;
  name!: string;
  slug!: string;
}

export class ArticleTagSummaryDto {
  id!: string;
  name!: string;
  slug!: string;
}

export class ArticleResponseDto {
  id!: number;
  title!: string;
  slug!: string;
  excerpt!: string | null;
  content!: string;
  seoTitle!: string | null;
  seoDescription!: string | null;
  featuredImage!: string | null;
  status!: ArticleStatus;
  featured!: boolean;
  isFeatured!: boolean;
  isBreaking!: boolean;
  isHero!: boolean;
  hasVideo!: boolean;
  videoUrl!: string | null;
  viewsCount!: number;
  publishedAt!: Date | null;
  authorId!: string;
  author?: ArticleAuthorDto;
  categories!: ArticleCategorySummaryDto[];
  tags!: ArticleTagSummaryDto[];
  createdAt!: Date;
  updatedAt!: Date;
}

export class PaginatedArticlesDto {
  data!: ArticleResponseDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
