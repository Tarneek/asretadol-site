type ErrorStateProps = {
  title?: string;
  message?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again later.',
}: ErrorStateProps) {
  return (
    <div className="state-box" role="alert">
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="muted" style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
