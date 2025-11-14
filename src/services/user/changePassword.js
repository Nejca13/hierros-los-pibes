export const changePassword = async (user_id, newPassword, oldPassword) => {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      password: newPassword,
      old_password: oldPassword,
    }),
  }

  try {
    const response = await fetch(
      `/api/users/update-password/${user_id}/`,
      options
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Error response:', result)
      return { success: false, message: result.detail || 'Error desconocido' }
    }

    console.log('Success response:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error(error)
    return { success: false, message: error.message || 'Error desconocido' }
  }
}
