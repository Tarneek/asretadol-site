type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="stack" style={{ marginBottom: '1.5rem' }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {description ? <p className="muted" style={{ margin: 0 }}>{description}</p> : null}
    </header>
  );
}
