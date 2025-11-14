const API_URL = '/api/reservation/'

export const createReservation = async (data) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }

  try {
    const response = await fetch(API_URL + 'create-reservation/', options)

    if (!response.ok) {
      const error = await response.json()
      console.log('Error response:', error)
      return { success: false, message: error || 'Unknown error' }
    }
    const data = await response.json()
    console.log('Success response:', data)
    return { success: true, data }
  } catch (error) {
    console.log(error)
    return { success: false, message: error }
  }
}

export const getReservation = async () => {
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      const error = await response.json()
      console.log('Error response:', error)
      return { success: false, message: error || 'Unknown error' }
    }
    const data = await response.json()
    console.log('Success response:', data)
    return { success: true, data }
  } catch (error) {
    console.log(error)
    return { success: false, message: error }
  }
}

export const getReservationById = async (user_id) => {
  try {
    const response = await fetch(API_URL + `/user/${user_id}/`)

    if (!response.ok) {
      const error = await response.json()
      console.log('Error response:', error)
      return { success: false, message: error || 'Unknown error' }
    }
    const data = await response.json()
    console.log('Success response:', data)
    return { success: true, data }
  } catch (error) {
    console.log(error)
    return { success: false, message: error }
  }
}

export const getReservationsByCourtAndDate = async (courtId, date) => {
  const url = `?date=${date}&court_id=${courtId}`

  try {
    const response = await fetch(API_URL + `/filter/by-date-and-court/${url}`)

    if (!response.ok) {
      const error = await response.json()
      console.log('Error response:', error)
      return { success: false, message: error || 'Unknown error' }
    }
    const data = await response.json()
    console.log('Success response:', data)
    return { success: true, data }
  } catch (error) {
    console.log(error)
    return { success: false, message: error }
  }
}

export const deleteReservation = async (user_id) => {
  const options = {
    method: 'DELETE',
  }
  try {
    const response = await fetch(API_URL + `/${user_id}/`, options)

    if (!response.ok) {
      const error = await response.json()
      console.log('Error response:', error)
      return { success: false, message: error || 'Unknown error' }
    }
    const data = await response.json()
    // console.log('Success response:', data)
    return { success: true, data }
  } catch (error) {
    console.log(error)
    return { success: false, message: error }
  }
}


export const reservationByDate = async (date) => {
  try {
    const response = await fetch(API_URL + `/filter/by-date/?date=${date}`)

    if (!response.ok) {
      const error = await response.json()
      console.log('Error response:', error)
      return { success: false, message: error || 'Unknown error' }
    }
    const data = await response.json()
    console.log('Success response:', data)
    return { success: true, data }
  } catch (error) {
    console.log(error)
    return { success: false, message: error }
  }
}
