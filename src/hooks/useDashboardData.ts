import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { deleteVulnerability as deleteVulnerabilityRequest, getDashboard, getVulnerabilityPage, saveVulnerability as saveVulnerabilityRequest } from '../api'
import type { DashboardData, VulnerabilityInput, VulnerabilityPage, VulnerabilityQuery } from '../types'

const initialQuery: VulnerabilityQuery = {
  page: 1,
  pageSize: 12,
  severity: 'All',
  status: 'All',
  search: '',
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState(initialQuery)
  const [vulnerabilityPage, setVulnerabilityPage] = useState<VulnerabilityPage | null>(null)
  const [listError, setListError] = useState('')
  const [listVersion, setListVersion] = useState(0)

  useEffect(() => {
    let active = true
    getDashboard()
      .then((dashboard) => {
        if (active) setData(dashboard)
      })
      .catch((error: unknown) => {
        console.error('Failed to load dashboard data', error)
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load dashboard data.')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    getVulnerabilityPage(query)
      .then((page) => {
        if (!active) return
        setVulnerabilityPage(page)
        setListError('')
        if (page.page !== query.page) {
          setQuery((current) => current.page === query.page ? { ...current, page: page.page } : current)
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load vulnerabilities', error)
        if (active) setListError(error instanceof Error ? error.message : 'Unable to load vulnerabilities.')
      })
    return () => {
      active = false
    }
  }, [query, listVersion])

  const refreshDashboard = useCallback(async () => {
    try {
      setData(await getDashboard())
      setLoadError('')
    } catch (error) {
      console.error('Failed to refresh dashboard data', error)
      setLoadError(error instanceof Error ? error.message : 'Unable to refresh dashboard data.')
    }
  }, [])

  const saveVulnerability = useCallback(async (id: number | null, input: VulnerabilityInput) => {
    await saveVulnerabilityRequest(id, input)
    await refreshDashboard()
    if (id === null) {
      setQuery((current) => ({ ...current, page: 1 }))
    }
    setListVersion((version) => version + 1)
  }, [refreshDashboard])

  const removeVulnerability = useCallback(async (id: number) => {
    await deleteVulnerabilityRequest(id)
    await refreshDashboard()
    setListVersion((version) => version + 1)
  }, [refreshDashboard])

  const updateQuery: Dispatch<SetStateAction<VulnerabilityQuery>> = setQuery

  return {
    data,
    loadError,
    query,
    updateQuery,
    vulnerabilityPage,
    listError,
    saveVulnerability,
    deleteVulnerability: removeVulnerability,
  }
}
