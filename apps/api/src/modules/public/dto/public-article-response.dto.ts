import { PaginationMeta } from './pagination-query.dto';

export class PublicAuthorDto {
  id!: string;
  displayName!: string;
}

export class PublicCategoryDto {
  id!: string;
  name!: string;
  slug!: string;
}

export class PublicTagDto {
  id!: string;
  name!: string;
  slug!: string;
}

/** Card / list shape for homepage widgets and listings (no full body). */
export class PublicArticleCardDto {
  id!: number;
  title!: string;
  slug!: string;
  excerpt!: string | null;
  featuredImage!: string | null;
  featured!: boolean;
  isFeatured!: boolean;
  isBreaking!: boolean;
  isHero!: boolean;
  hasVideo!: boolean;
  publishedAt!: Date;
  author!: PublicAuthorDto;
  categories!: PublicCategoryDto[];
  tags!: PublicTagDto[];
}

/** Full article for detail pages. */
export class PublicArticleDetailDto extends PublicArticleCardDto {
  content!: string;
  videoUrl!: string | null;
  seoTitle!: string | null;
  seoDescription!: string | null;
  updatedAt!: Date;
}

export class PaginatedPublicArticlesDto {
  data!: PublicArticleCardDto[];
  meta!: PaginationMeta;
}

export class PublicSearchResultDto {
  query!: string;
  data!: PublicArticleCardDto[];
  meta!: PaginationMeta;
}

export class PublicCategoryArticlesDto {
  category!: PublicCategoryDto & { description: string | null };
  data!: PublicArticleCardDto[];
  meta!: PaginationMeta;
}

export class PublicTagArticlesDto {
  tag!: PublicTagDto;
  data!: PublicArticleCardDto[];
  meta!: PaginationMeta;
}
