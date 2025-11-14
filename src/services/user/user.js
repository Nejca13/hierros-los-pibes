const API_URL = '/api/users/'

export const getUsers = async ({ role = null }) => {
  const options = {
    method: 'GET',
  }

  const searchParams = new URLSearchParams()
  if (role) searchParams.append('role', role)

  const url = `${API_URL}?${searchParams.toString()}`

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al obtener usuarios:', error)
      return {
        success: false,
        error: error.detail || 'Error desconocido',
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
      error: error.message || 'Error de red desconocido',
    }
  }
}

export const deleteUser = async (id) => {
  const options = {
    method: 'DELETE',
  }

  try {
    const response = await fetch(API_URL + `delete/${id}/`, options)
    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.detail,
      }
    }

    const data = response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Error de red:', error)
    return {
      success: false,
      error: error,
    }
  }
}
