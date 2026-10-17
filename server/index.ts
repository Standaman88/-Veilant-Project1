import cors from 'cors'
import express, { type RequestHandler } from 'express'
import {
  createVulnerability,
  checkDatabaseConnection,
  DatabaseUnavailableError,
  deleteVulnerability,
  getDashboardData,
  getVulnerabilityPage,
  getVulnerabilityById,
  updateVulnerability,
} from './db.js'
import type { Severity, Status, VulnerabilityInput } from './data.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function parseId(value: string | string[]): number {
  if (typeof value !== 'string') {
    throw new ApiError('ID must be a positive integer.', 400)
  }
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError('ID must be a positive integer.', 400)
  }
  return id
}

function parseQueryInteger(value: unknown, name: string, fallback: number, maximum: number): number {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new ApiError(`${name} must be a positive integer.`, 400)
  }
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new ApiError(`${name} must be between 1 and ${maximum}.`, 400)
  }
  return parsed
}

function parseVulnerabilityInput(body: unknown): VulnerabilityInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError('Request body must be an object.', 400)
  }

  const value = body as Record<string, unknown>
  const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low']
  const statuses: Status[] = ['Open', 'In Progress', 'Mitigated', 'Resolved']
  const requiredText = (key: string, maxLength: number) => {
    const field = value[key]
    if (typeof field !== 'string' || !field.trim() || field.trim().length > maxLength) {
      throw new ApiError(`${key} must be a non-empty string of at most ${maxLength} characters.`, 400)
    }
    return field.trim()
  }
  const dateField = (key: string) => {
    const field = requiredText(key, 10)
    const parsedDate = new Date(`${field}T00:00:00.000Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(field) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== field) {
      throw new ApiError(`${key} must be a valid date in YYYY-MM-DD format.`, 400)
    }
    return field
  }

  const assetId = value.assetId
  if (!Number.isInteger(assetId) || Number(assetId) < 1) {
    throw new ApiError('assetId must be a positive integer.', 400)
  }

  const severity = value.severity
  if (typeof severity !== 'string' || !severities.includes(severity as Severity)) {
    throw new ApiError('severity must be Critical, High, Medium, or Low.', 400)
  }

  const status = value.status
  if (typeof status !== 'string' || !statuses.includes(status as Status)) {
    throw new ApiError('status must be Open, In Progress, Mitigated, or Resolved.', 400)
  }

  const cvss = value.cvss
  if (typeof cvss !== 'number' || !Number.isFinite(cvss) || cvss < 0 || cvss > 10 || Math.round(cvss * 10) !== cvss * 10) {
    throw new ApiError('cvss must be a number from 0.0 to 10.0 with at most one decimal place.', 400)
  }

  return {
    assetId: Number(assetId),
    title: requiredText('title', 255),
    severity: severity as Severity,
    cvss,
    status: status as Status,
    owner: requiredText('owner', 255),
    packageName: requiredText('packageName', 255),
    lastSeen: dateField('lastSeen'),
    dueDate: dateField('dueDate'),
  }
}

function isDatabaseUnavailable(error: unknown) {
  if (error instanceof DatabaseUnavailableError) return true
  if (!error || typeof error !== 'object' || !('code' in error) || typeof error.code !== 'string') return false

  return error.code.startsWith('08') ||
    ['28P01', '3D000', '57P03', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code)
}

app.use(cors())
app.use(express.json())

app.get('/api/health', asyncRoute(async (_req, res) => {
  const database = await checkDatabaseConnection()
  if (!database.connected) {
    res.status(503).json({
      status: 'degraded',
      database: { status: 'disconnected', error: database.error },
    })
    return
  }

  res.json({ status: 'ok', database: { status: 'connected' } })
}))

app.get('/api/dashboard', asyncRoute(async (_req, res) => {
  const dashboard = await getDashboardData()
  res.json(dashboard)
}))

app.get('/api/assets', asyncRoute(async (_req, res) => {
  const dashboard = await getDashboardData()
  res.json(dashboard.assets)
}))

app.get('/api/vulnerabilities/:id', asyncRoute(async (req, res) => {
  const vulnerability = await getVulnerabilityById(parseId(req.params.id))
  if (!vulnerability) {
    throw new ApiError('Vulnerability not found.', 404)
  }
  res.json(vulnerability)
}))

app.post('/api/vulnerabilities', asyncRoute(async (req, res) => {
  const vulnerability = await createVulnerability(parseVulnerabilityInput(req.body))
  if (!vulnerability) {
    throw new ApiError('The selected asset does not exist.', 400)
  }
  res.status(201).json(vulnerability)
}))

app.put('/api/vulnerabilities/:id', asyncRoute(async (req, res) => {
  const vulnerability = await updateVulnerability(parseId(req.params.id), parseVulnerabilityInput(req.body))
  if (!vulnerability) {
    throw new ApiError('Vulnerability or selected asset not found.', 404)
  }
  res.json(vulnerability)
}))

app.delete('/api/vulnerabilities/:id', asyncRoute(async (req, res) => {
  const deleted = await deleteVulnerability(parseId(req.params.id))
  if (!deleted) {
    throw new ApiError('Vulnerability not found.', 404)
  }
  res.status(204).end()
}))

app.get('/api/vulnerabilities', asyncRoute(async (req, res) => {
  const severity = typeof req.query.severity === 'string' ? req.query.severity : 'All'
  const status = typeof req.query.status === 'string' ? req.query.status : 'All'
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : ''
  const severities: Array<Severity | 'All'> = ['All', 'Critical', 'High', 'Medium', 'Low']
  const statuses: Array<Status | 'All'> = ['All', 'Open', 'In Progress', 'Mitigated', 'Resolved']
  if (!severities.includes(severity as Severity | 'All')) {
    throw new ApiError('severity is invalid.', 400)
  }
  if (!statuses.includes(status as Status | 'All')) {
    throw new ApiError('status is invalid.', 400)
  }
  if (search.length > 200) {
    throw new ApiError('search must be at most 200 characters.', 400)
  }

  const page = parseQueryInteger(req.query.page, 'page', 1, Number.MAX_SAFE_INTEGER)
  const pageSize = parseQueryInteger(req.query.pageSize, 'pageSize', 12, 100)
  res.json(await getVulnerabilityPage({ page, pageSize, severity, status, search }))
}))

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: error.message })
    return
  }

  if (isDatabaseUnavailable(error)) {
    res.status(503).json({
      error: 'PostgreSQL is unavailable. Copy .env.example to .env, start PostgreSQL with `npm run db:up`, then run `npm run db:setup`.',
    })
    return
  }

  if (error && typeof error === 'object' && 'status' in error && error.status === 400) {
    const message = 'message' in error && typeof error.message === 'string' ? error.message : 'Invalid request.'
    res.status(400).json({ error: message })
    return
  }

  console.error('API request failed:', error)
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(port, () => {
  console.log(`Veilant API running on http://localhost:${port}`)
})
