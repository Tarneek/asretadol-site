import type { PaginationMeta } from './public-api';

export type AdminArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  featuredImage: string | null;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  featured: boolean;
  isFeatured: boolean;
  isBreaking: boolean;
  isHero: boolean;
  hasVideo: boolean;
  videoUrl: string | null;
  viewsCount: number;
  publishedAt: string | null;
  authorId: string;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
};

export type AdminDashboardStats = {
  totalArticles: number;
  totalViews: number;
  draftCount: number;
  publishedCount: number;
  scheduledCount: number;
  activeStories: number;
};

export type AdminViewsChartPoint = {
  date: string;
  views: number;
};

export type AdminViewsChart = {
  days: number;
  totalInRange: number;
  points: AdminViewsChartPoint[];
};

export type PaginatedAdminArticles = {
  data: AdminArticle[];
  meta: PaginationMeta;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminTag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminStory = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  link: string | null;
  isActive: boolean;
  createdAt: string;
};
