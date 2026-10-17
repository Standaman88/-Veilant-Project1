export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
export type Status = 'Open' | 'In Progress' | 'Mitigated' | 'Resolved'

export type Asset = {
  id: number
  name: string
  environment: string
  owner: string
  businessUnit: string
  riskScore: number
  critical: number
  high: number
  medium: number
}

export type Vulnerability = {
  id: number
  assetId: number
  asset: string
  title: string
  severity: Severity
  cvss: number
  status: Status
  owner: string
  packageName: string
  lastSeen: string
  dueDate: string
}

export type VulnerabilityInput = Omit<Vulnerability, 'id' | 'asset'>

export type TrendPoint = {
  label: string
  critical: number
  high: number
  medium: number
}

export type Overview = {
  totalOpen: number
  critical: number
  high: number
  containedThisWeek: number
  remediationRate: number
  atRiskAssets: number
}

export type DashboardData = {
  overview: Overview
  assets: Asset[]
  vulnerabilities: Vulnerability[]
  trend: TrendPoint[]
}
