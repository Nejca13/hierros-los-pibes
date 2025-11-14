import Lupa from '@/assets/icons/Lupa'
import styles from './FormDate.module.css'
import { useEffect, useState } from 'react'
import IoIosArrowDown from '@/assets/icons/IoIosArrowDown'

const FormDate = ({ obtenerReportes }) => {
  const [attendedByUsers, setAttendedByUsers] = useState([])

  const getUser = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    try {
      const response = await fetch('/api/users?role=admin', options)

      if (!response.ok) {
        const error = await response.json()
        console.error('Error al obtener usuarios:', error)
        throw new Error('Error al obtener usuarios')
      }

      const data = await response.json()
      console.log('Usuarios con rol admin:', data)
      setAttendedByUsers(data)
      return data
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return null
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.target))
    console.log('formData', formData)
    obtenerReportes(
      formData.from_date,
      formData.to_date,
      formData.attended_by_user_id || null
    )
  }

  useEffect(() => {
    getUser()
  }, [])

  return (
    <form onSubmit={handleSubmit} className={styles.form_date}>
      <label htmlFor='from_date'>
        Fecha desde:
        <input type='date' name='from_date' id='from_date' required />
      </label>
      <label htmlFor='to_date'>
        Fecha hasta:
        <input type='date' name='to_date' id='to_date' />
      </label>
      <label htmlFor='attended_by_user_id'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select name='attended_by_user_id' id='attended_by_user_id'>
          <option value=''>Seleccione usuario</option>
          {attendedByUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>
      <button type='submith'>
        <Lupa color='white' width='14px' height='14px' />
        Buscar
      </button>
    </form>
  )
}

export default FormDate
