import { useCallback, useEffect, useState } from 'react'
import type { DashboardData, Vulnerability, VulnerabilityInput } from '../types'

function apiBaseUrl() {
  return window.location.hostname === 'localhost' ? 'http://localhost:4000' : ''
}

function withVulnerabilities(data: DashboardData, vulnerabilities: Vulnerability[]): DashboardData {
  const assets = data.assets.map((asset) => {
    const assetVulnerabilities = vulnerabilities.filter((item) => item.assetId === asset.id)
    return {
      ...asset,
      critical: assetVulnerabilities.filter((item) => item.severity === 'Critical').length,
      high: assetVulnerabilities.filter((item) => item.severity === 'High').length,
      medium: assetVulnerabilities.filter((item) => item.severity === 'Medium').length,
    }
  })
  const critical = vulnerabilities.filter((item) => item.severity === 'Critical').length
  const high = vulnerabilities.filter((item) => item.severity === 'High').length

  return {
    ...data,
    assets,
    vulnerabilities,
    overview: {
      ...data.overview,
      totalOpen: vulnerabilities.filter((item) => item.status !== 'Resolved').length,
      critical,
      high,
      atRiskAssets: new Set(
        vulnerabilities
          .filter((item) => item.severity === 'Critical' || item.severity === 'High')
          .map((item) => item.assetId),
      ).size,
    },
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with status ${response.status}`)
  }
  return payload as T
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    fetch(`${apiBaseUrl()}/api/dashboard`)
      .then(readResponse<DashboardData>)
      .then(setData)
      .catch((error: unknown) => {
        console.error('Failed to load dashboard data', error)
        setLoadError(error instanceof Error ? error.message : 'Unable to load dashboard data.')
      })
  }, [])

  const saveVulnerability = useCallback(async (id: number | null, input: VulnerabilityInput) => {
    const response = await fetch(`${apiBaseUrl()}/api/vulnerabilities${id === null ? '' : `/${id}`}`, {
      method: id === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const vulnerability = await readResponse<Vulnerability>(response)

    setData((current) => {
      if (!current) return current
      const vulnerabilities = id === null
        ? [vulnerability, ...current.vulnerabilities]
        : current.vulnerabilities.map((item) => item.id === id ? vulnerability : item)
      return withVulnerabilities(current, vulnerabilities)
    })
  }, [])

  const deleteVulnerability = useCallback(async (id: number) => {
    const response = await fetch(`${apiBaseUrl()}/api/vulnerabilities/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      const payload = await response.json()
      throw new Error(payload.error ?? `Request failed with status ${response.status}`)
    }

    setData((current) => current
      ? withVulnerabilities(current, current.vulnerabilities.filter((item) => item.id !== id))
      : current)
  }, [])

  return { data, loadError, saveVulnerability, deleteVulnerability }
}
