import type { TrendPoint } from '../types'

type ExposureTrendProps = {
  trend: TrendPoint[]
}

export function ExposureTrend({ trend }: ExposureTrendProps) {
  const trendMax = Math.max(1, ...trend.flatMap((point) => [point.critical, point.high, point.medium]))
  const totals = trend.reduce(
    (result, point) => ({
      critical: result.critical + point.critical,
      high: result.high + point.high,
      medium: result.medium + point.medium,
    }),
    { critical: 0, high: 0, medium: 0 },
  )

  return (
    <section className="panel wide-panel" id="exposure">
      <div className="panel-header">
        <div>
          <p className="eyebrow muted">Exposure trend</p>
          <h2>Vulnerability trend</h2>
        </div>
        <span className="subtle-pill">Last 30 days</span>
      </div>

      <div className="trend-chart-wrap">
        <p className="trend-axis-title">Findings by week</p>
        <div className="trend-chart" role="img" aria-label="Vulnerability findings by severity across six weeks">
          {trend.map((point) => (
            <div key={point.label} className="trend-column">
              <div className="bars">
                <span
                  className="bar critical"
                  style={{ height: `${(point.critical / trendMax) * 100}%` }}
                  title={`${point.label}: ${point.critical} critical`}
                />
                <span
                  className="bar high"
                  style={{ height: `${(point.high / trendMax) * 100}%` }}
                  title={`${point.label}: ${point.high} high`}
                />
                <span
                  className="bar medium"
                  style={{ height: `${(point.medium / trendMax) * 100}%` }}
                  title={`${point.label}: ${point.medium} medium`}
                />
              </div>
              <label>{point.label}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="trend-legend" aria-label="Trend series">
        <span className="legend-item critical"><i />Critical<strong>{totals.critical}</strong></span>
        <span className="legend-item high"><i />High<strong>{totals.high}</strong></span>
        <span className="legend-item medium"><i />Medium<strong>{totals.medium}</strong></span>
      </div>
    </section>
  )
}
