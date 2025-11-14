import { useState, useEffect } from 'react'
import styles from './Filters.module.css'
import IoIosArrowDown from '@/assets/icons/IoIosArrowDown'
import RemoveFilter from '@/assets/icons/RemoveFilter'

const initialFilterState = {
  payment_method: '',
  payment_origin: '',
  status: '',
  from_date: '',
  to_date: '',
  kitchen_status: '',
  attended_by_user_id: '',
}

const Filters = ({ updateFilter, resetFilters }) => {
  const [filters, setFilters] = useState(initialFilterState)
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    updateFilter(name, value)
  }

  const handleReset = () => {
    setFilters(initialFilterState)
    resetFilters()
    localStorage.removeItem('filters') // Limpiar los filtros guardados
  }

  useEffect(() => {
    // Recuperar filtros desde localStorage si existen
    const storedFilters = localStorage.getItem('filters')
    if (storedFilters) {
      setFilters(JSON.parse(storedFilters))
    }
    // Obtener usuarios al cargar el componente
    getUser()
  }, [])

  useEffect(() => {
    // Guardar los filtros en localStorage cuando cambian
    localStorage.setItem('filters', JSON.stringify(filters))
  }, [filters])

  return (
    <div className={styles.filter_container}>
      <label htmlFor='from_date'>
        Desde
        <input
          type='date'
          name='from_date'
          id='from_date'
          value={filters.from_date}
          onChange={handleChange}
        />
      </label>

      {/* Fecha Hasta */}
      <label htmlFor='to_date'>
        Hasta
        <input
          type='date'
          name='to_date'
          id='to_date'
          value={filters.to_date}
          onChange={handleChange}
        />
      </label>
      {/* Payment Method */}
      <label htmlFor='payment_origin'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='payment_origin'
          id='payment_origin'
          value={filters.payment_origin}
          onChange={handleChange}
        >
          <option value='' disabled>
            Método de pago
          </option>
          <option value='mercadopago'>Mercado Pago</option>
          <option value='caja'>Caja</option>
        </select>
      </label>

      <label htmlFor='payment_method'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='payment_method'
          id='payment_method'
          value={filters.payment_method}
          onChange={handleChange}
        >
          <option value='' disabled>
            Origen del pago
          </option>
          <option value='transferencia'>Transferencia</option>
          <option value='efectivo'>Efectivo</option>
        </select>
      </label>

      {/* Status */}
      <label htmlFor='status'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='status'
          id='status'
          value={filters.status}
          onChange={handleChange}
        >
          <option value='' disabled>
            Estado del pago
          </option>
          <option value='paid'>Pagado</option>
          <option value='pending'>Pendiente</option>
          <option value='failed'>Cancelado</option>
        </select>
      </label>

      {/* Estado en cocina */}
      <label htmlFor='kitchen_status'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='kitchen_status'
          id='kitchen_status'
          value={filters.kitchen_status}
          onChange={handleChange}
        >
          <option value='' disabled>
            Estado en cocina
          </option>
          <option value='pending'>Pendiente</option>
          <option value='sent'>Enviado</option>
          <option value='finished'>Finalizado</option>
        </select>
      </label>
      {/* Ventas por usuario */}
      <label htmlFor='attended_by_user_id'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='attended_by_user_id'
          id='attended_by_user_id'
          value={filters.attended_by_user_id}
          onChange={handleChange}
        >
          <option value='' disabled>
            Ventas por usuario
          </option>
          {attendedByUsers.map((user, index) => (
            <option key={index} value={user.id}>
              {user?.name + ' ' + user?.last_name}
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
