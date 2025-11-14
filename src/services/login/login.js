export const login = async (credenciales) => {
  const credencialesURL = new URLSearchParams(credenciales)
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: credencialesURL,
  }

  try {
    const response = await fetch('/api/login/', options)

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

export const recoveryPassword = async (email) => {
  const options = {
    method: 'POST',
  }
  try {
    const response = await fetch(
      `/api/password-recovery/recover-password/?email=${email}`,
      options
    )

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

export const changePassword = async (user_id, newPassword) => {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({ password: newPassword }),
  }

  try {
    const response = await fetch(
      `/api/users/update-password/${user_id}/`,
      options
    )
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
