import { adminStatusLabel } from '@/lib/admin-labels';

type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return <span className={`badge badge--${status}`}>{adminStatusLabel(status)}</span>;
}

export function FeaturedBadge() {
  return <span className="badge badge--featured">ویژه</span>;
}

export function HeroBadge() {
  return <span className="badge badge--hero">سرتیتر</span>;
}

export function BreakingBadge() {
  return <span className="badge badge--breaking">فوری</span>;
}
