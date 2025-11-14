const API_URL = '/api/courts/'

export const createCourt = async (data) => {
  const formatedData = new FormData()
  formatedData.append('image', data.image)
  formatedData.append('court', JSON.stringify(data))
  const options = {
    method: 'POST',
    body: formatedData,
  }

  try {
    const response = await fetch(API_URL + 'create-court/', options)
    if (!response) {
      return {
        success: false,
        error: 'No se pudo crear la cancha',
      }
    } else {
      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error,
    }
  }
}

export const getCourts = async () => {
  const options = {
    method: 'GET',
  }

  try {
    const response = await fetch(API_URL + 'get-courts/', options)
    if (!response) {
      return {
        success: false,
        error: 'No se pudo obtener las canchas',
      }
    } else {
      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error,
    }
  }
}

export const deleteCourt = async (court_id) => {
  const options = {
    method: 'DELETE',
  }

  try {
    const response = await fetch(
      API_URL + `/delete-court/${court_id}/`,
      options
    )
    if (!response) {
      return {
        success: false,
        error: 'Error al elminar la cancha',
      }
    } else {
      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error,
    }
  }
}

export const updateCourt = async (court_id, data) => {
  const options = {
    method: 'PATCH',
    body: data,
  }

  try {
    const response = await fetch(
      API_URL + `/update-court/${court_id}/`,
      options
    )
    if (!response) {
      return {
        success: false,
        error: 'Error al actualizar la cancha',
      }
    } else {
      const data = await response.json()
      return {
        success: true,
        data: data,
      }
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error,
    }
  }
}
