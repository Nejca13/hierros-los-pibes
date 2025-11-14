import { useState, useCallback, useEffect } from 'react'
import { getCategories } from '@/services/categories/categories'

const useCategorias = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCategorias = useCallback(() => {
    setLoading(true)
    setError(null)

    getCategories()
      .then((res) => {
        if (!res.success) {
          setError(`Error al obtener categorías: ${res.error}`)
          setData([])
          return
        }
        setData(res.data)
      })
      .catch((err) => {
        console.error('Error al obtener categorías:', err)
        setError('Ocurrió un error al cargar las categorías.')
        setData([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchCategorias()
  }, [fetchCategorias])

  return {
    data,
    loading,
    error,
    refresh: fetchCategorias,
  }
}

export default useCategorias
