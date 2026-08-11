import Link from 'next/link';
import { IconNewspaper } from '@/components/icons/site-icons';

type SectionHeaderProps = {
  title: string;
  moreHref?: string;
  moreLabel?: string;
  showDate?: boolean;
  dateLabel?: string;
};

export function SectionHeader({
  title,
  moreHref,
  moreLabel = 'مشاهده بیشتر',
  showDate,
  dateLabel,
}: SectionHeaderProps) {
  return (
    <div className={showDate ? 'lineTitle' : 'lineTitle2'}>
      <div className="titlepart">
        <h4 className="heading-with-icon">
          <IconNewspaper size={22} className="heading-with-icon__glyph" />
          <span>{title}</span>
        </h4>
      </div>
      <div className="line">
        {showDate && dateLabel ? <div className="datebox">{dateLabel}</div> : null}
      </div>
      {moreHref ? (
        <div className="more">
          <Link href={moreHref} className="btn-danger">
            {moreLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
