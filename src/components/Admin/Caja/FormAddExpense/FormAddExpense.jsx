'use client'
import Spinner from '@/components/Spinner/Spinner'
import { useState } from 'react'
import styles from './FormAddExpense.module.css'
import Swal from 'sweetalert2'

const FormAddExpense = ({
  onClose,
  isCashSessionActive,
  cashSessionActive,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

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

  //formulario añadir expensa
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = Object.fromEntries(new FormData(e.target))
    formData.amount = rawValue

    try {
      const response = await fetch(
        `/api/cash-sessions/${isCashSessionActive[0]?._id}/expense/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        throw new Error('Error al registrar la expensa')
      }

      const data = await response.json()
      console.log(data)
      onClose()
      cashSessionActive()

      Swal.fire({
        icon: 'success',
        title: 'Expensa registrada',
        html: `
          <p>La expensa fue agregada correctamente.</p>
        `,
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
      <h2 className={styles.title_form}>Agregar gastos</h2>
      <label htmlFor='amount'>
        <input
          type='text'
          id='amount'
          name='amount'
          placeholder='Monto de la expensa'
          value={formattedValue}
          onChange={handleInputChange}
          inputMode='numeric'
          required
        />
      </label>
      <label htmlFor='reason'>
        <input
          type='text'
          id='reason'
          name='reason'
          placeholder='Ingrese el motivo de la expensa'
          required
        />
      </label>
      <label htmlFor='payment_method'>
        <select name='payment_method' id='payment_method'>
          <option value=''>Seleccione un método de pago</option>
          <option value='efectivo'>Efectivo</option>
          <option value='transferencia'>Transferencia</option>
        </select>
      </label>
      <button type='submit'>{loading ? <Spinner /> : 'Crear expensa'}</button>
      {error && <small className={styles.error}>{error}</small>}
    </form>
  )
}

export default FormAddExpense
