'use client'
import useStore from '@/app/store'
import styles from './FormOpenCash.module.css'
import Spinner from '@/components/Spinner/Spinner'
import Swal from 'sweetalert2'
import { useState } from 'react'

const FormOpenCash = ({ cashSessionActive, onClose }) => {
  const { currentUser } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formattedValue, setFormattedValue] = useState('')
  const [rawValue, setRawValue] = useState(0)

  function moneyFormat(value) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const handleInputChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')
    const numeric = parseInt(onlyNumbers || '0', 10) / 100
    setRawValue(numeric)
    setFormattedValue(moneyFormat(numeric))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = {
      opening_amount: rawValue,
      user_id: currentUser?.user?.id,
    }

    try {
      const response = await fetch('/api/cash-sessions/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Error al abrir la caja')

      await response.json()
      onClose()
      cashSessionActive()

      Swal.fire({
        icon: 'success',
        title: 'Caja abierta',
        text: 'La caja se abrió correctamente.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      })
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h2 className={styles.title_form}>Abrir caja</h2>
      <label htmlFor='opening_amount'>
        <input
          type='text'
          id='opening_amount'
          name='opening_amount'
          value={formattedValue}
          onChange={handleInputChange}
          placeholder='Ingrese el monto con el que va abrir la caja'
          inputMode='numeric'
          required
        />
      </label>
      <button type='submit'>{loading ? <Spinner /> : 'Abrir caja'}</button>
      {error && <small className={styles.error}>{error}</small>}
    </form>
  )
}

export default FormOpenCash
