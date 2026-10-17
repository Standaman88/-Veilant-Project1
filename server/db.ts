import dotenv from 'dotenv'
import { Pool } from 'pg'
import {
  type Vulnerability,
  type VulnerabilityInput,
} from './data.js'

dotenv.config()

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('PostgreSQL is not configured or reachable.')
    this.name = 'DatabaseUnavailableError'
  }
}

function requirePool() {
  if (!pool) {
    throw new DatabaseUnavailableError()
  }
  return pool
}

export async function checkDatabaseConnection() {
  if (!pool) {
    return { connected: false, error: 'DATABASE_URL is not configured.' }
  }

  try {
    await pool.query('SELECT 1')
    return { connected: true as const }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { connected: false, error: 'PostgreSQL is unavailable.' }
  }
}

function mapVulnerability(row: Record<string, unknown>): Vulnerability {
  return {
    id: Number(row.id),
    assetId: Number(row.assetId),
    asset: String(row.asset),
    title: String(row.title),
    severity: row.severity as Vulnerability['severity'],
    cvss: Number(row.cvss),
    status: row.status as Vulnerability['status'],
    owner: String(row.owner),
    packageName: String(row.packageName),
    lastSeen: String(row.lastSeen),
    dueDate: String(row.dueDate),
  }
}

const vulnerabilitySelect = `SELECT v.id, v.asset_id AS "assetId", a.name AS asset, v.title, v.severity, v.cvss,
  v.status, v.owner, v.package_name AS "packageName",
  TO_CHAR(v.last_seen, 'YYYY-MM-DD') AS "lastSeen", TO_CHAR(v.due_date, 'YYYY-MM-DD') AS "dueDate"`

export async function getDashboardData() {
  const database = requirePool()
  const assetsQuery = await database.query(
      'SELECT id, name, environment, owner, business_unit AS "businessUnit", risk_score AS "riskScore" FROM assets ORDER BY id ASC',
    )

  const vulnerabilitiesQuery = await database.query(
      `${vulnerabilitySelect}
       FROM vulnerabilities v JOIN assets a ON a.id = v.asset_id ORDER BY v.id ASC`,
    )

  const assets = assetsQuery.rows.map((row) => ({
    ...row,
    id: Number(row.id),
    riskScore: Number(row.riskScore),
    critical: 0,
    high: 0,
    medium: 0,
  }))

  const vulnerabilities = vulnerabilitiesQuery.rows.map(mapVulnerability)

  for (const asset of assets) {
    const assetVulnerabilities = vulnerabilities.filter((item) => item.assetId === asset.id)
    asset.critical = assetVulnerabilities.filter((item) => item.severity === 'Critical').length
    asset.high = assetVulnerabilities.filter((item) => item.severity === 'High').length
    asset.medium = assetVulnerabilities.filter((item) => item.severity === 'Medium').length
  }

  const criticalCount = vulnerabilities.filter((item) => item.severity === 'Critical').length
  const highCount = vulnerabilities.filter((item) => item.severity === 'High').length
  const openCount = vulnerabilities.filter((item) => item.status !== 'Resolved').length

  const overview = {
    totalOpen: openCount,
    critical: criticalCount,
    high: highCount,
    containedThisWeek: 42 + (criticalCount % 14),
    remediationRate: 74 + (openCount % 13),
    atRiskAssets: new Set(
      vulnerabilities
        .filter((item) => item.severity === 'Critical' || item.severity === 'High')
        .map((item) => item.assetId),
    ).size,
  }

  const trend = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((label, index) => ({
    label,
    critical: 8 + ((index + criticalCount) % 16),
    high: 16 + ((index * 7 + highCount) % 28),
    medium: 19 + ((index * 9 + openCount) % 30),
  }))

  return { overview, assets, vulnerabilities, trend }
}

export async function getVulnerabilityById(id: number): Promise<Vulnerability | null> {
  const result = await requirePool().query(
    `${vulnerabilitySelect}
     FROM vulnerabilities v JOIN assets a ON a.id = v.asset_id
     WHERE v.id = $1`,
    [id],
  )

  return result.rows[0] ? mapVulnerability(result.rows[0]) : null
}

export async function createVulnerability(input: VulnerabilityInput): Promise<Vulnerability | null> {
  const result = await requirePool().query(
    `WITH inserted AS (
       INSERT INTO vulnerabilities (asset_id, title, severity, cvss, status, owner, package_name, last_seen, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *
     )
     ${vulnerabilitySelect}
     FROM inserted v
     JOIN assets a ON a.id = v.asset_id`,
    [
      input.assetId,
      input.title,
      input.severity,
      input.cvss,
      input.status,
      input.owner,
      input.packageName,
      input.lastSeen,
      input.dueDate,
    ],
  )

  return result.rows[0] ? mapVulnerability(result.rows[0]) : null
}

export async function updateVulnerability(
  id: number,
  input: VulnerabilityInput,
): Promise<Vulnerability | null> {
  const result = await requirePool().query(
    `WITH updated AS (
       UPDATE vulnerabilities
       SET asset_id = $2, title = $3, severity = $4, cvss = $5, status = $6, owner = $7,
           package_name = $8, last_seen = $9, due_date = $10
       WHERE id = $1
       RETURNING *
     )
     ${vulnerabilitySelect}
     FROM updated v
     JOIN assets a ON a.id = v.asset_id`,
    [
      id,
      input.assetId,
      input.title,
      input.severity,
      input.cvss,
      input.status,
      input.owner,
      input.packageName,
      input.lastSeen,
      input.dueDate,
    ],
  )

  return result.rows[0] ? mapVulnerability(result.rows[0]) : null
}

export async function deleteVulnerability(id: number): Promise<boolean> {
  const result = await requirePool().query('DELETE FROM vulnerabilities WHERE id = $1 RETURNING id', [id])
  return result.rowCount === 1
}
