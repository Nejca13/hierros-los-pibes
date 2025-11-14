const API_URL = '/api/products/'

export const createProduct = async (data) => {
  const formatedData = new FormData()
  formatedData.append('product_image', data.image)
  delete data.image
  formatedData.append('product_data', JSON.stringify(data))

  const options = {
    method: 'POST',
    body: formatedData,
  }

  try {
    const response = await fetch(API_URL, options)

    if (!response.ok) {
      const error = await response.json()
      console.error('Error del servidor:', error)

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
    console.error('Error al crear producto:', error)
    return {
      success: false,
      error: error,
    }
  }
}

export const getProducts = async ({
  query = null,
  page = 1,
  limit = 20,
  sort = 'desc',
  category = null,
  available = null,
  featured = null,
}) => {
  const searchParams = new URLSearchParams()

  if (query) searchParams.append('query', query)
  if (page) searchParams.append('page', page.toString())
  if (limit) searchParams.append('limit', limit.toString())
  if (sort) searchParams.append('sort', sort)
  if (category) searchParams.append('category', category)
  if (available !== null) searchParams.append('available', available.toString())
  if (featured !== null) searchParams.append('featured', featured.toString())

  const url = `${API_URL}all/paginated/?${searchParams.toString()}`

  try {
    const response = await fetch(url, { method: 'GET' })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al obtener productos:', data)
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
    console.error('Error de red:', error)
    return {
      success: false,
      error: error,
    }
  }
}

export const updateProduct = async (id, data) => {
  const formatedData = new FormData()

  if (data.image) {
    formatedData.append('product_image', data.image)
    delete data.image
  }

  formatedData.append('product_data', JSON.stringify(data))

  const options = {
    method: 'PUT',
    body: formatedData,
  }

  try {
    const response = await fetch(API_URL + `${id}`, options)
    if (!response.ok) {
      const error = await response.json()
      console.error(' Error al actualizar producto:', data)
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
    console.error('Error de red:', error)
    return {
      success: false,
      error,
    }
  }
}

export const deleteProduct = async (id) => {
  const options = {
    method: 'DELETE',
  }

  try {
    const response = await fetch(API_URL + `/${id}/`, options)
    if (!response.ok) {
      const error = await response.json()
      console.error('Error al eliminar producto:', response)
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
    console.error('Error de red:', error)
    return {
      success: false,
      error: error,
    }
  }
}
