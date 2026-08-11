import Link from 'next/link';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="state-box">
      <h2 className="state-box__title">{title}</h2>
      <p className="state-box__message">{message}</p>
      {actionLabel && actionHref ? (
        <p style={{ marginTop: '1rem', marginBottom: 0 }}>
          <Link href={actionHref} className="btn btn--primary">
            {actionLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
