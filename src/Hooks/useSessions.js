import { getCashSessions } from '@/services/sessions/sessions'
import { useEffect, useState, useCallback } from 'react'

export const useCashSessions = () => {
  const [data, setData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [errorData, setErrorData] = useState(null)

  const initialFilters = {
    page: 1,
    limit: 25,
    user_id: null,
    sort_type: null,
    user_id: null,
    from_date: null,
    to_date: null,
  }

  const [filters, setFilters] = useState(initialFilters)

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    setErrorData(null)

    try {
      const response = await getCashSessions(filters)
      if (response.success) {
        setData(response.data)
      } else {
        setErrorData(response.error || 'Error al cargar sesiones de caja')
      }
    } catch (err) {
      setErrorData('Error de conexión')
    } finally {
      setLoadingData(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  return {
    data,
    loadingData,
    errorData,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    refresh: fetchData,
  }
}
