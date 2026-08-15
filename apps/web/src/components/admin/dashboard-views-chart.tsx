import type { AdminViewsChart } from '@/lib/types/admin-api';
import { formatFaChartDay, formatFaNumber } from '@/lib/format';

type Props = {
  chart: AdminViewsChart;
  unavailable?: boolean;
};

export function DashboardViewsChart({ chart, unavailable = false }: Props) {
  const width = 640;
  const height = 220;
  const padX = 36;
  const padY = 28;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = chart.points;
  const maxViews = Math.max(1, ...points.map((p) => p.views));
  const coords = points.map((p, i) => {
    const x = padX + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = padY + innerH - (p.views / maxViews) * innerH;
    return { x, y, ...p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x.toFixed(2) ?? padX} ${(padY + innerH).toFixed(2)} L ${coords[0]?.x.toFixed(2) ?? padX} ${(padY + innerH).toFixed(2)} Z`;

  const yTicks = [...new Set([0, Math.ceil(maxViews / 2), maxViews])].sort((a, b) => a - b);
  const labelIndices = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]);

  return (
    <section className="chart-panel" aria-labelledby="dashboard-views-chart-title">
      <div className="chart-panel__header">
        <div>
          <h2 id="dashboard-views-chart-title" className="chart-panel__title">
            بازدید مطالب
          </h2>
          <p className="chart-panel__subtitle">
            {formatFaNumber(chart.days)} روز گذشته ·{' '}
            {formatFaNumber(chart.totalInRange)} بازدید ثبت‌شده
          </p>
        </div>
      </div>

      {unavailable ? (
        <p className="chart-panel__empty" role="status">
          نمودار بازدید موقتاً در دسترس نیست. آمار کلی داشبورد همچنان به‌روز است؛ در صورت نیاز
          مهاجرت پایگاه داده را اجرا کنید.
        </p>
      ) : chart.totalInRange === 0 ? (
        <p className="chart-panel__empty">
          هنوز بازدید روزانه‌ای ثبت نشده. با باز شدن مطالب در سایت، نمودار پر می‌شود.
        </p>
      ) : null}

      <div className="chart-panel__canvas-wrap">
        <svg
          className="views-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="نمودار بازدید روزانه مطالب"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="viewsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(63, 81, 181, 0.28)" />
              <stop offset="100%" stopColor="rgba(63, 81, 181, 0.02)" />
            </linearGradient>
          </defs>

          {yTicks.map((tick, tickIndex) => {
            const y = padY + innerH - (tick / maxViews) * innerH;
            return (
              <g key={`y-tick-${tickIndex}-${tick}`}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  className="views-chart__grid"
                />
                <text x={padX - 8} y={y + 4} className="views-chart__axis-y" textAnchor="end">
                  {formatFaNumber(tick)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#viewsAreaFill)" />
          <path d={linePath} className="views-chart__line" fill="none" />

          {coords.map((c, i) => (
            <circle key={c.date} cx={c.x} cy={c.y} r={3.5} className="views-chart__dot">
              <title>
                {formatFaChartDay(c.date)}: {formatFaNumber(c.views)} بازدید
              </title>
            </circle>
          ))}

          {coords.map(
            (c, i) =>
              labelIndices.has(i) ? (
                <text key={`${c.date}-label`} x={c.x} y={height - 6} className="views-chart__axis-x" textAnchor="middle">
                  {formatFaChartDay(c.date)}
                </text>
              ) : null,
          )}
        </svg>
      </div>
    </section>
  );
}
