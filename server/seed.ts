import { pool } from './db.js'
import { buildDashboardData } from './data.js'

async function seedDatabase() {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured. Set it before seeding PostgreSQL.')
  }

  const client = await pool.connect()
  let inTransaction = false

  try {
    await client.query('BEGIN')
    inTransaction = true
    await client.query('SELECT pg_advisory_xact_lock(71420319)')

    const existing = await client.query('SELECT EXISTS (SELECT 1 FROM assets) AS seeded')
    if (existing.rows[0].seeded) {
      await client.query('COMMIT')
      inTransaction = false
      console.log('Database already contains assets; skipping seed to preserve existing data.')
      return
    }

    const dashboard = buildDashboardData()
    const assetIds = new Map<number, number>()

    for (const asset of dashboard.assets) {
      const result = await client.query(
        `INSERT INTO assets (name, environment, owner, business_unit, risk_score)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [asset.name, asset.environment, asset.owner, asset.businessUnit, asset.riskScore],
      )
      assetIds.set(asset.id, Number(result.rows[0].id))
    }

    for (const vulnerability of dashboard.vulnerabilities) {
      const assetId = assetIds.get(vulnerability.assetId)
      if (assetId === undefined) {
        throw new Error(`Seed vulnerability ${vulnerability.id} refers to missing asset ${vulnerability.assetId}.`)
      }

      await client.query(
        `INSERT INTO vulnerabilities (asset_id, title, severity, cvss, status, owner, package_name, last_seen, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          assetId,
          vulnerability.title,
          vulnerability.severity,
          vulnerability.cvss,
          vulnerability.status,
          vulnerability.owner,
          vulnerability.packageName,
          vulnerability.lastSeen,
          vulnerability.dueDate,
        ],
      )
    }

    await client.query('COMMIT')
    inTransaction = false
    console.log(`Seeded ${dashboard.vulnerabilities.length} vulnerabilities across ${dashboard.assets.length} assets.`)
  } catch (error) {
    if (inTransaction) {
      await client.query('ROLLBACK')
    }
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

seedDatabase().catch((error: unknown) => {
  console.error('Database seed failed:', error)
  process.exitCode = 1
})
