export default function AdminCmsLoading() {
  return (
    <div className="state-box state-box--loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      <span className="muted">در حال بارگذاری…</span>
    </div>
  );
}
