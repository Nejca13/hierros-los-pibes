const API_URL = '/api/categories/'

export const getCategories = async () => {
  const options = {
    method: 'GET',
  }

  try {
    const response = await fetch(API_URL, options)

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.detail,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Error en la petición:', error)
    return {
      success: false,
      error: 'Error de red o servidor',
    }
  }
}

export const createCategories = async (data) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }

  try {
    const response = await fetch(API_URL, options)

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al crear la categoria', error)
      return {
        success: false,
        error: error.detail,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Error al crear la categoria:', error)
    return {
      success: false,
      error: error,
    }
  }
}

export const upadateCategories = async (id, data) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }

  try {
    const response = await fetch(API_URL + `${id}/`, options)

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al actualizar la categoria', error)

      return {
        success: false,
        error: error,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Error al actualizar la categoria:', error)
    return {
      success: false,
      error: error,
    }
  }
}

export const deleteCategories = async (id) => {
  const options = {
    method: 'DELETE',
  }

  try {
    const response = await fetch(API_URL + `${id}`, options)
    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.detail,
      }
    }

    return {
      success: true,
      data: response,
    }
  } catch (error) {
    console.error('Error de red:', error)
    return {
      success: false,
      error: error,
    }
  }
}
