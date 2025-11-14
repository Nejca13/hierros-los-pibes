import { useEffect, useState, useCallback } from 'react'
import { getOrders } from '@/services/orders/orders'

export const useOrders = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estado inicial de los filtros
  const initialFilters = {
    page: 1,
    limit: 25,
    sort_type: null,
    user_id: null,
    guest_email: null,
    payment_method: null,
    payment_origin: null,
    kitchen_status: null,
    attended_by_user_id: null,
    min_total: null,
    max_total: null,
    status: null,
    table: null,
    from_date: null,
    to_date: null,
  }

  const [filters, setFilters] = useState(initialFilters)
  useEffect(() => {
    // Recuperar filtros desde localStorage si existen
    const storedFilters = localStorage.getItem('filters')
    if (storedFilters) {
      setFilters((prev) => ({
        ...prev,
        ...JSON.parse(storedFilters),
      }))
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getOrders(filters)
      if (response.success) {
        setData(response.data)
      } else {
        setError(response.error || 'Error al cargar órdenes')
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
    setFilters((prev) => {
      const updatedFilters = { ...prev, [key]: value }
      // Guardar los filtros actualizados en localStorage
      localStorage.setItem('filters', JSON.stringify(updatedFilters))
      return updatedFilters
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    localStorage.removeItem('filters') // Limpiar los filtros en localStorage
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
