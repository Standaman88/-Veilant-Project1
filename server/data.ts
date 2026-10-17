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

const assetNames = [
  'prod-api-gateway',
  'identity-portal',
  'workspace-router',
  'oss-connector',
  'merchant-billing',
  'analytics-lake',
  'partner-queue',
  'customer-portal',
  'sso-control-plane',
  'edge-broker',
  'risk-scorer',
  'vpn-access',
  'cloud-iam',
  'ops-automation',
  'device-registry',
  'inventory-sync',
  'ml-graph-index',
  'ticketing-core',
  'email-gateway',
  'compliance-reports',
  'sales-ops',
  'case-manager',
  'onboarding-api',
  'mobile-backend',
  'data-federation',
  'support-chat',
  'warehouse-bridge',
  'finance-sync',
  'user-events',
  'network-policy',
  'alert-orchestrator',
  'policy-engine',
  'threat-modeler',
  'content-graph',
  'vuln-remediator',
  'customer-knowledge',
  'adapters-service',
  'sandbox-runner',
  'telemetry-ingest',
  'log-retention',
  'session-manager',
]

const packageNames = [
  'axios',
  'express',
  'lodash',
  'openssl',
  'node-fetch',
  'spring-core',
  'tomcat',
  'nginx',
  'redis',
  'postgresql',
  'jquery',
  'moment',
  'log4j',
  'python-ldap',
  'protobuf',
  'libxml2',
  'workerpool',
  'webpack',
  'grpc',
  'openssl-fips',
  'pillow',
  'urllib3',
  'requests',
  'vite',
  'react',
  'next',
  'eslint',
  'zlib',
  'libssh2',
  'django',
]

const titles = [
  'Command injection in XML parser',
  'Reflected XSS in session callback',
  'Insufficient TLS certificate validation',
  'Deserialization flaw in cluster cache',
  'Weak JWT signing configuration',
  'Path traversal in attachment loader',
  'Unbounded memory allocation in parser',
  'Sensitive file disclosure via debug endpoint',
  'Server-side request forgery in proxy',
  'Privilege escalation via role mapping',
  'Insecure random token generation',
  'Denial of service in regex validation',
  'Open redirect in authentication flow',
  'Cross-site request forgery in admin API',
  'Hardcoded credentials in deployment config',
]

const owners = ['A. Chen', 'M. Ruiz', 'S. Patel', 'J. Morgan', 'N. Brooks', 'R. Singh']
const environments = ['Production', 'Staging', 'Development']
const businessUnits = ['Platform', 'Infrastructure', 'Security', 'Analytics', 'Compliance']
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function formatDate(offsetDays: number) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function generateAssets(): Asset[] {
  return assetNames.map((name, index) => ({
    id: index + 1,
    name,
    environment: environments[index % environments.length],
    owner: owners[index % owners.length],
    businessUnit: businessUnits[index % businessUnits.length],
    riskScore: 42 + ((index * 19) % 58),
    critical: 0,
    high: 0,
    medium: 0,
  }))
}

function generateVulnerabilities(assets: Asset[]): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = []
  const random = createRandom(0x5eed1234)

  for (let index = 1; index <= 600; index += 1) {
    const asset = assets[(index - 1) % assets.length]
    const severityRoll = random()
    const severity: Severity =
      severityRoll < 0.08 ? 'Critical' :
        severityRoll < 0.3 ? 'High' :
          severityRoll < 0.67 ? 'Medium' : 'Low'
    const statusRoll = random()
    const status: Status =
      statusRoll < 0.52 ? 'Open' :
        statusRoll < 0.73 ? 'In Progress' :
          statusRoll < 0.87 ? 'Mitigated' : 'Resolved'
    const title = titles[(index - 1) % titles.length]
    const packageName = packageNames[(index * 7) % packageNames.length]
    const cvssVariation = random()
    const cvss =
      severity === 'Critical'
        ? Number((9 + (cvssVariation * 1)).toFixed(1))
        : severity === 'High'
          ? Number((7 + (cvssVariation * 1.9)).toFixed(1))
          : severity === 'Medium'
            ? Number((4 + (cvssVariation * 2.9)).toFixed(1))
            : Number((0.1 + (cvssVariation * 3.8)).toFixed(1))

    vulnerabilities.push({
      id: index,
      assetId: asset.id,
      asset: asset.name,
      title,
      severity,
      cvss,
      status,
      owner: asset.owner,
      packageName,
      lastSeen: formatDate(-(index % 18)),
      dueDate: formatDate((index % 11) - 2),
    })
  }

  return vulnerabilities
}

export function buildDashboardData(): DashboardData {
  const assets = generateAssets()
  const vulnerabilities = generateVulnerabilities(assets)

  const criticalCount = vulnerabilities.filter((item) => item.severity === 'Critical').length
  const highCount = vulnerabilities.filter((item) => item.severity === 'High').length
  const openCount = vulnerabilities.filter((item) => item.status !== 'Resolved').length
  const atRiskAssets = new Set(
    vulnerabilities
      .filter((item) => item.severity === 'Critical' || item.severity === 'High')
      .map((item) => item.assetId),
  ).size

  const trend: TrendPoint[] = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((label, index) => ({
    label,
    critical: 10 + ((index + criticalCount) % 18),
    high: 18 + ((index * 7 + highCount) % 30),
    medium: 22 + ((index * 9 + openCount) % 31),
  }))

  const overview: Overview = {
    totalOpen: openCount,
    critical: criticalCount,
    high: highCount,
    containedThisWeek: 42 + (criticalCount % 14),
    remediationRate: 74 + (openCount % 13),
    atRiskAssets,
  }

  assets.forEach((asset) => {
    const assetVulns = vulnerabilities.filter((item) => item.assetId === asset.id)
    asset.critical = assetVulns.filter((item) => item.severity === 'Critical').length
    asset.high = assetVulns.filter((item) => item.severity === 'High').length
    asset.medium = assetVulns.filter((item) => item.severity === 'Medium').length
  })

  return { overview, assets, vulnerabilities, trend }
}
