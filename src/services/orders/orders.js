const API_URL = '/api/orders/'

export const createOrders = async (data) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }

  try {
    const response = await fetch(API_URL + 'create/', options)

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al crear la orden', error)
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
    console.error('Error al crear la orden:', error)
    return {
      success: false,
      error: error,
    }
  }
}

export const getOrders = async ({
  page = 1,
  limit = 25,
  sort_type = null,
  user_id = null,
  guest_email = null,
  payment_method = null,
  payment_origin = null,
  sent_to_kitchen = null,
  displayed_to_client = null,
  kitchen_status = null,
  attended_by_user_id = null,
  min_total = null,
  max_total = null,
  status = null,
  table = null,
  from_date = null,
  to_date = null,
}) => {
  const searchParams = new URLSearchParams()

  if (page) searchParams.append('page', page.toString())
  if (limit) searchParams.append('limit', limit)
  if (sort_type) searchParams.append('sort_type', sort_type)
  if (user_id) searchParams.append('user_id', user_id)
  if (guest_email) searchParams.append('guest_email', guest_email)
  if (payment_method) searchParams.append('payment_method', payment_method)
  if (payment_origin) searchParams.append('payment_origin', payment_origin)
  if (sent_to_kitchen) searchParams.append('sent_to_kitchen', sent_to_kitchen)
  if (displayed_to_client)
    searchParams.append('displayed_to_client', displayed_to_client)
  if (kitchen_status) searchParams.append('kitchen_status', kitchen_status)
  if (attended_by_user_id)
    searchParams.append('attended_by_user_id', attended_by_user_id)
  if (min_total !== null) searchParams.append('min_total', min_total.toString())
  if (max_total !== null) searchParams.append('max_total', max_total.toString())
  if (status) searchParams.append('status', status)
  if (kitchen_status) searchParams.append('kitchen_status', kitchen_status)
  if (table) searchParams.append('table', table)
  if (from_date) searchParams.append('from_date', from_date)
  if (to_date) searchParams.append('to_date', to_date)

  const url = `${API_URL}?${searchParams.toString()}`

  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) {
      const error = await response.json()
      console.error('Error al obtener órdenes:', error)
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

export const updateOrder = async (id, data) => {
  const options = {
    method: 'PUT',
    body: JSON.stringify(data),
  }

  try {
    const response = await fetch(API_URL + `${id}/`, options)
    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.detail,
      }
    }

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

export const deleteOrder = async (id) => {
  const options = {
    method: 'DELETE',
  }

  try {
    const response = await fetch(API_URL + `/${id}/`, options)
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

export const getReports = async (from_date, to_date, attended_by_user_id) => {
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }

  const params = new URLSearchParams({ from_date })

  if (to_date) {
    params.append('to_date', to_date)
  }

  if (attended_by_user_id) {
    params.append('attended_by_user_id', attended_by_user_id)
  }

  const url = `${API_URL}orders/report?${params.toString()}`

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json()
      console.error('Error de respuesta del servidor:', error)
      return { success: false, error: error.detail }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error de red:', error)
    return { success: false, error: error.message }
  }
}

export const getInternalOrders = async ({
  page = 1,
  limit = 25,
  user_id = null,
  sort_type = 'desc',
  from_date = null,
  to_date = null,
}) => {
  const searchParams = new URLSearchParams()

  if (page) searchParams.append('page', page.toString())
  if (limit) searchParams.append('limit', limit)
  if (user_id) searchParams.append('user_id', user_id)
  if (sort_type) searchParams.append('sort_type', sort_type)
  if (from_date) searchParams.append('from_date', from_date)
  if (to_date) searchParams.append('to_date', to_date)

  const url = `${API_URL}internal-orders/?${searchParams.toString()}`

  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) {
      const error = await response.json()
      console.error('Error al obtener órdenes internas:', error)
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
