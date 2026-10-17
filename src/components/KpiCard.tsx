type KpiCardProps = {
  label: string
  value: number | string
  detail: string
  tone?: 'danger' | 'success'
}

export function KpiCard({ label, value, detail, tone }: KpiCardProps) {
  return (
    <article className={`kpi-card${tone ? ` ${tone}` : ''}`}>
      <span className="kpi-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}
