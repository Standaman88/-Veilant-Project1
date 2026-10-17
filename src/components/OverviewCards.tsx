import type { Overview } from '../types'

type OverviewCardsProps = {
  overview: Overview
  assetCount: number
}

export function OverviewCards({ overview, assetCount }: OverviewCardsProps) {
  return (
    <section className="kpi-grid">
      <article className="kpi-card danger">
        <span className="kpi-label">Open vulnerabilities</span>
        <strong>{overview.totalOpen}</strong>
        <small>Across {assetCount} active assets</small>
      </article>
      <article className="kpi-card">
        <span className="kpi-label">Critical</span>
        <strong>{overview.critical}</strong>
        <small>Immediate response required</small>
      </article>
      <article className="kpi-card">
        <span className="kpi-label">High priority</span>
        <strong>{overview.high}</strong>
        <small>Within SLA window</small>
      </article>
      <article className="kpi-card success">
        <span className="kpi-label">Contained this week</span>
        <strong>{overview.containedThisWeek}</strong>
        <small>Remediation velocity {overview.remediationRate}%</small>
      </article>
    </section>
  )
}
