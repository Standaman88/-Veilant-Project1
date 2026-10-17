import type { Overview } from '../types'
import { KpiCard } from './KpiCard'

type OverviewCardsProps = {
  overview: Overview
  assetCount: number
}

export function OverviewCards({ overview, assetCount }: OverviewCardsProps) {
  return (
    <section className="kpi-grid">
      <KpiCard
        label="Open vulnerabilities"
        value={overview.totalOpen}
        detail={`Across ${assetCount} active assets`}
        tone="danger"
      />
      <KpiCard label="Critical" value={overview.critical} detail="Immediate response required" />
      <KpiCard label="High priority" value={overview.high} detail="Within SLA window" />
      <KpiCard
        label="Contained this week"
        value={overview.containedThisWeek}
        detail={`Remediation velocity ${overview.remediationRate}%`}
        tone="success"
      />
    </section>
  )
}
