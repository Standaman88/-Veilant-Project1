import type {
  DashboardData,
  Vulnerability,
  VulnerabilityInput,
  VulnerabilityPage,
  VulnerabilityQuery,
} from './types'

function apiBaseUrl() {
  return window.location.hostname === 'localhost' ? 'http://localhost:4000' : ''
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json()
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : `Request failed with status ${response.status}`
    throw new Error(message)
  }
  return payload as T
}

export async function getDashboard(): Promise<DashboardData> {
  return readResponse<DashboardData>(await fetch(`${apiBaseUrl()}/api/dashboard`))
}

export async function getVulnerabilityPage(query: VulnerabilityQuery): Promise<VulnerabilityPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    severity: query.severity,
    status: query.status,
    search: query.search,
  })
  return readResponse<VulnerabilityPage>(
    await fetch(`${apiBaseUrl()}/api/vulnerabilities?${params.toString()}`),
  )
}

export async function saveVulnerability(id: number | null, input: VulnerabilityInput): Promise<Vulnerability> {
  const response = await fetch(`${apiBaseUrl()}/api/vulnerabilities${id === null ? '' : `/${id}`}`, {
    method: id === null ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return readResponse<Vulnerability>(response)
}

export async function deleteVulnerability(id: number): Promise<void> {
  const response = await fetch(`${apiBaseUrl()}/api/vulnerabilities/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    await readResponse<never>(response)
  }
}
