import { useEffect, useState, useCallback } from 'react'
import { getProducts } from '@/services/products/products'

export const useProducts = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    query: '',
    page: 1,
    limit: 2000,
    sort: 'desc',
    category: null,
    available: null,
    featured: null,
  })
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getProducts(filters)
      if (response.success) {
        setData(response.data)
      } else {
        setError(response.error || 'Error al cargar productos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [filters])

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      page: 1,
      limit: 31,
      sort: 'desc',
      category: null,
      available: null,
      featured: null,
    })
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
