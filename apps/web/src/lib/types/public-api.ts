export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PublicAuthor = {
  id: string;
  displayName: string;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
};

export type PublicTag = {
  id: string;
  name: string;
  slug: string;
};

export type PublicStory = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  link: string | null;
  createdAt: string;
};

export type PublicArticleCard = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featured: boolean;
  isFeatured: boolean;
  isBreaking: boolean;
  isHero: boolean;
  hasVideo: boolean;
  publishedAt: string;
  author: PublicAuthor;
  categories: PublicCategory[];
  tags: PublicTag[];
};

export type PublicArticleDetail = PublicArticleCard & {
  content: string;
  videoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

export type PaginatedPublicArticles = {
  data: PublicArticleCard[];
  meta: PaginationMeta;
};

export type PublicCategoryArticles = {
  category: PublicCategory & { description: string | null };
  data: PublicArticleCard[];
  meta: PaginationMeta;
};

export type PublicTagArticles = {
  tag: PublicTag;
  data: PublicArticleCard[];
  meta: PaginationMeta;
};

export type ListArticlesParams = {
  page?: number;
  limit?: number;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
};
