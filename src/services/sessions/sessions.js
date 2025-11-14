const CASH_SESSIONS_API_URL = '/api/cash-sessions/'

export const getCashSessions = async ({
  page = 1,
  limit = 25,
  user_id = null,
  from_date = null,
  to_date = null,
  sort_type = null, // 'asc' o 'desc'
}) => {
  const searchParams = new URLSearchParams()

  if (page) searchParams.append('page', page.toString())
  if (limit) searchParams.append('limit', limit.toString())
  if (user_id) searchParams.append('user_id', user_id)
  if (from_date) searchParams.append('from_date', from_date)
  if (to_date) searchParams.append('to_date', to_date)
  if (sort_type) searchParams.append('sort_type', sort_type)

  const url = `${CASH_SESSIONS_API_URL}?${searchParams.toString()}`

  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) {
      const error = await response.json()
      console.error('Error al obtener sesiones de caja:', error)
      return {
        success: false,
        error: error.detail,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error de red:', error)
    return {
      success: false,
      error,
    }
  }
}
