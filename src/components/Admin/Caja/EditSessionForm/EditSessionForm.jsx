'use client'
import { useState } from 'react'
import styles from './EditSessionForm.module.css'
import Spinner from '@/components/Spinner/Spinner'
import Swal from 'sweetalert2'

const EditSessionForm = ({
  isCashSessionActive,
  cashSessionActive,
  onClose,
}) => {
  const session = isCashSessionActive[0]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formattedValue, setFormattedValue] = useState('')
  const [rawValue, setRawValue] = useState(session?.opening_amount || 0)
  const [expenses, setExpenses] = useState(
    session?.movements.filter((m) => m.type === 'expense') || []
  )

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

  const handleExpenseChange = (id, newAmount) => {
    const numeric = parseInt(newAmount.replace(/\D/g, '') || '0', 10) / 100
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, amount: numeric } : e))
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      opening_amount: rawValue,
      updated_expenses: expenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        reason: e.reason,
        type: e.type,
        payment_method: e.payment_method,
      })),
    }

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
    console.log(payload)
    try {
      const response = await fetch(
        `/api/cash-sessions/update/${session?._id}/`,
        options
      )

      if (!response.ok) throw new Error('Error al actualizar la caja')

      await response.json()
      onClose()
      cashSessionActive()

      Swal.fire({
        icon: 'success',
        title: 'Caja actualizada',
        confirmButtonColor: '#3085d6',
      })
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  console.log(expenses)

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h2 className={styles.title_form}>Actualizar caja</h2>
      <label htmlFor='opening_amount'>
        Monto de apertura:
        <input
          type='text'
          id='opening_amount'
          name='opening_amount'
          value={formattedValue || moneyFormat(rawValue)}
          onChange={handleInputChange}
          placeholder='Ingrese el nuevo monto de apertura'
          inputMode='numeric'
          required
        />
      </label>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Editar Monto</th>
            <th>Razón</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((movement) => (
            <tr key={movement.id}>
              <td>
                <input
                  type='text'
                  value={moneyFormat(movement.amount)}
                  onChange={(e) =>
                    handleExpenseChange(movement.id, e.target.value)
                  }
                />
              </td>
              <td className={styles.ellipsis}>{movement.reason}</td>
              <td>{new Date(movement.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type='submit' disabled={loading}>
        {loading ? <Spinner /> : 'Guardar cambios'}
      </button>

      {error && <small className={styles.error}>{error}</small>}
    </form>
  )
}

export default EditSessionForm
