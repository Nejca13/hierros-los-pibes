import { getInternalOrders } from '@/services/orders/orders'
import { useEffect, useState, useCallback } from 'react'

export const useInternalOrders = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const initialFilters = {
    page: 1,
    limit: 25,
    user_id: null,
    sort_type: 'desc',
    from_date: null,
    to_date: null,
  }

  const [filters, setFilters] = useState(initialFilters)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getInternalOrders(filters)
      if (response.success) {
        setData(response.data)
      } else {
        setError(response.error || 'Error al cargar órdenes internas')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
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
    loading,
    error,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    refresh: fetchData,
  }
}
