const API_URL = '/api/users/'

export const updateUser = async (id, data) => {
  const formData = new FormData()

  // Comprobar que la imagen sea un archivo
  if (data.img instanceof File) {
    formData.append('image', data.img)
    delete data.img
  }
  formData.append('user', JSON.stringify(data))
  const options = {
    method: 'PATCH',
    body: formData,
  }

  try {
    const response = await fetch(API_URL + `${id}/`, options)
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
