import { useState, useEffect } from 'react'
import styles from './Filters.module.css'
import IoIosArrowDown from '@/assets/icons/IoIosArrowDown'
import RemoveFilter from '@/assets/icons/RemoveFilter'

const initialFilterState = {
  //   from_date: '',
  //   to_date: '',
  user_id: '',
  sort_type: '',
}

const Filters = ({ updateFilter, resetFilters }) => {
  const [filters, setFilters] = useState(initialFilterState)
  const [user, setUser] = useState([])

  const getUser = async () => {
    try {
      const response = await fetch('/api/users/')
      if (!response.ok) {
        throw new Error('Error al obtener usuarios')
      }
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    updateFilter(name, value)
  }

  const handleReset = () => {
    setFilters(initialFilterState)
    resetFilters()
  }

  useEffect(() => {
    getUser()
  }, [])

  return (
    <div className={styles.filter_container}>
      {/* <label htmlFor='from_date'>
        Desde
        <input
          type='date'
          name='from_date'
          id='from_date'
          value={filters.from_date}
          onChange={handleChange}
        />
      </label>

      <label htmlFor='to_date'>
        Hasta
        <input
          type='date'
          name='to_date'
          id='to_date'
          value={filters.to_date}
          onChange={handleChange}
        />
      </label> */}

      {/* Sort Type */}
      <label htmlFor='sort_type'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='sort_type'
          id='sort_type'
          value={filters.sort_type}
          onChange={handleChange}
        >
          <option value='desc'>Descendente</option>
          <option value='asc'>Ascendente</option>
        </select>
      </label>

      {/* Empleados */}
      <label htmlFor='user_id'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='user_id'
          id='user_id'
          value={filters.user_id}
          onChange={handleChange}
        >
          <option value='' disabled>
            Usuario
          </option>
          {user
            ?.filter((user) => ['admin', 'empleado'].includes(user.role))
            .map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} {user.last_name}
              </option>
            ))}
        </select>
      </label>

      <button type='button' onClick={handleReset}>
        Limpiar filtros
        <RemoveFilter width='14px' height='14px' />
      </button>
    </div>
  )
}

export default Filters
