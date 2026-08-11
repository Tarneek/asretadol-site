type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="state-box" role="status" aria-live="polite">
      <p className="muted" style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
