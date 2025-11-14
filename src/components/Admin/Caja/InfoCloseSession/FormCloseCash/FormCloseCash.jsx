'use client'
import { useEffect, useState } from 'react'
import styles from './FormCloseCash.module.css'
import InputFormatNumber from '@/components/InputFormatNumber/InputFormatNumber'
import Close from '@/assets/icons/Close'
import Swal from 'sweetalert2'
import InputFormatTotal from '@/components/InputFormatTotal/InputFormatTotal'

const FormCloseCash = ({
  session_id,
  cashSessionActive,
  refresh,
  onClose,
  setShowFormCloseCash,
}) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  //estados para sumar los valores de ingresos
  const [ingresos, setIngresos] = useState({
    efectivo: 0,
    transferencia: 0,
    total: 0,
  })

  //estados para sumar los valores de egresos
  const [egresos, setEgresos] = useState({
    efectivo: 0,
    transferencia: 0,
    total: 0,
  })

  //bucamos la session por id
  const getSession = async () => {
    setLoading(true)
    setError(null)

    if (!session_id) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/cash-sessions/${session_id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener sesión de caja activa')
      }

      const data = await response.json()
      setSession(data)
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  // Función para cerrar la sesión de caja
  const closeCashSession = async (body) => {
    console.log(body)
    try {
      const response = await fetch(`/api/cash-sessions/${session_id}/close/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Error al cerrar la sesión de caja')
      }

      const data = await response.json()
      console.log(data)

      Swal.fire(
        'Caja cerrada',
        'La sesión de caja fue cerrada con éxito.',
        'success'
      )
      cashSessionActive()
      refresh()
      onClose()
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado')
    }
  }

  //formulario para cerrar caja
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = Object.fromEntries(new FormData(e.target))

    const fieldsToCompare = {
      income_by_method_efectivo:
        session?.session_summary?.movements_summary?.income_by_method
          ?.efectivo || 0,
      income_by_method_transferencia:
        session?.session_summary?.movements_summary?.income_by_method
          ?.transferencia || 0,
      income_total:
        session?.session_summary?.movements_summary?.total_income || 0,
      expense_by_method_efectivo:
        session?.session_summary?.movements_summary?.expense_by_method
          ?.efectivo || 0,
      expense_by_method_transferencia:
        session?.session_summary?.movements_summary?.expense_by_method
          ?.transferencia || 0,
      expense_total:
        session?.session_summary?.movements_summary?.total_expense || 0,
      opening_amount: session?.session?.opening_amount || 0,
      closing_amount: session?.session?.closing_amount || 0,
    }

    let hasMismatch = false

    for (const [key, expectedValue] of Object.entries(fieldsToCompare)) {
      const inputValueRaw = formData[key]
      const inputValue =
        parseFloat(inputValueRaw.replace(/\./g, '').replace(',', '.')) || 0

      if (inputValue !== expectedValue) {
        hasMismatch = true
        break
      }
    }

    //extraemos los valores de ingrso para enviar al backend
    const dataToSend = {
      counted_cash: Number(formData.income_by_method_efectivo) || 0,
      counted_transfer: Number(formData.income_by_method_transferencia),
    }

    setLoading(false)

    if (hasMismatch) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Inconsistencia detectada',
        text: 'Hay incongruencias en los valores. ¿Querés cerrar la caja de todas formas?',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar caja',
        cancelButtonText: 'No, revisar valores',
      })

      if (result.isConfirmed) {
        await closeCashSession(dataToSend)

        setShowFormCloseCash(false)
      } else {
        console.log('Usuario canceló cerrar caja para revisar valores.')
      }
    } else {
      const result = await Swal.fire({
        icon: 'success',
        title: 'Valores correctos',
        text: 'Los valores de la caja concuerdan perfectamente. ¿Confirmás cerrar la caja?',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar caja',
        cancelButtonText: 'No, quiero revisar',
      })

      if (result.isConfirmed) {
        await closeCashSession(dataToSend)

        setShowFormCloseCash(false)
      } else {
        console.log('Usuario canceló cerrar caja.')
      }
    }
  }

  useEffect(() => {
    if (session_id) {
      getSession()
    }
  }, [])

  const example = {
    session: {
      _id: '68499b02344ba278d81637a2',
      user_id: '682356b064a7f6cbca1ebdee',
      user_name: 'Nicolas Contreras',
      user_img:
        'http://localhost:3000/api/media/users/nicolascontreras677@gmail.com/c3b9281f-3301-4327-acd3-dac323563484.webp',
      opened_at: '2025-06-11T15:04:34.098000',
      closed_at: null,
      opening_amount: 1000,
      closing_amount: 14000,
      movements: [
        {
          id: '99126501-052e-439f-a144-6a3958315c0d',
          amount: 5000,
          reason: 'Nueva venta para el pedido ID:68499b0f344ba278d81637a3',
          type: 'income',
          payment_method: 'efectivo',
          created_at: '2025-06-11T15:04:47.790000',
        },
        {
          id: '934be7dc-27ca-46d6-a7f7-b6f68b04f93a',
          amount: 5000,
          reason: 'Nueva venta para el pedido ID:68499b19344ba278d81637a6',
          type: 'income',
          payment_method: 'efectivo',
          created_at: '2025-06-11T15:04:57.805000',
        },
        {
          id: 'c01edc04-ae2d-436a-a67f-96241059c488',
          amount: 2000,
          reason: 'Gastos',
          type: 'expense',
          payment_method: 'efectivo',
          created_at: '2025-06-11T15:05:18.509000',
        },
        {
          id: '7f0b4902-fd52-4382-ad57-29fedfe05fc2',
          amount: 5000,
          reason: 'Nueva venta para el pedido ID:6849f05ef4b1d4f77aed31f0',
          type: 'income',
          payment_method: 'transferencia',
          created_at: '2025-06-11T21:08:46.477000',
        },
      ],
      active: true,
      cash_diff: null,
      transfer_diff: null,
      closing_note: null,
    },
    session_summary: {
      _id: '68499b02344ba278d81637a2',
      user_id: '682356b064a7f6cbca1ebdee',
      user_name: 'Nicolas Contreras',
      user_img:
        'http://localhost:3000/api/media/users/nicolascontreras677@gmail.com/c3b9281f-3301-4327-acd3-dac323563484.webp',
      opened_at: '2025-06-11T15:04:34.098000',
      closed_at: null,
      opening_amount: 1000,
      closing_amount: 14000,
      active: true,
      cash_diff: null,
      transfer_diff: null,
      closing_note: null,
      movements_summary: {
        total_income: 15000,
        total_expense: 2000,
        income_by_method: {
          efectivo: 10000,
          transferencia: 5000,
        },
        expense_by_method: {
          efectivo: 2000,
        },
      },
    },
  }

  const ingresos_netos_esperados_efectivo = () => {
    const ingreso =
      session?.session_summary?.movements_summary?.income_by_method?.efectivo ??
      0
    const gasto =
      session?.session_summary?.movements_summary?.expense_by_method
        ?.efectivo ?? 0
    const apertura = session?.session?.opening_amount ?? 0

    return ingreso + apertura - gasto
  }

  const ingresos_netos_esperados_transferencia = () => {
    const ingreso =
      session?.session_summary?.movements_summary?.income_by_method
        ?.transferencia ?? 0
    const gasto =
      session?.session_summary?.movements_summary?.expense_by_method
        ?.transferencia ?? 0

    return ingreso - gasto
  }

  const ingresos_netos_esperados_total = () => {
    const ingreso =
      session?.session_summary?.movements_summary?.total_income ?? 0
    const gasto =
      session?.session_summary?.movements_summary?.total_expense ?? 0
    const apertura = session?.session?.opening_amount ?? 0

    return ingreso - gasto + apertura
  }

  console.log(session)
  console.log(
    session?.session_summary?.movements_summary?.income_by_method?.transferencia
  )
  return (
    <div className={styles.container_modal}>
      <h2>Cierre de caja ({session?.session?.user_name})</h2>
      <form onSubmit={onSubmit}>
        <p>Ingresos:</p>
        <div className={styles.form_group}>
          <InputFormatNumber
            title={'Ingresos en efectivo'}
            smallText={'Ingresos en efectivo esperado:'}
            id='income_by_method_efectivo'
            name='income_by_method_efectivo'
            placeholder='Ingresos en efectivo'
            realAmount={ingresos_netos_esperados_efectivo() || 0}
            setValue={(newValue) =>
              setIngresos((prev) => ({
                ...prev,
                efectivo: newValue,
                total: prev.transferencia + newValue,
              }))
            }
            required
          />

          <InputFormatNumber
            title={'Ingresos en transferencia'}
            smallText={'Ingresos en transferencia esperado:'}
            id='income_by_method_transferencia'
            name='income_by_method_transferencia'
            placeholder='Ingresos en transferencia'
            realAmount={ingresos_netos_esperados_transferencia() || 0}
            setValue={(newValue) =>
              setIngresos((prev) => ({
                ...prev,
                transferencia: newValue,
                total: prev.efectivo + newValue,
              }))
            }
            required
          />
          <InputFormatNumber
            title={'Ingreso total'}
            smallText={'Ingreso total esperado:'}
            id='income_total'
            name='income_total'
            placeholder='Ingresos total'
            realAmount={ingresos_netos_esperados_total() || 0}
            required
            controlledValue={ingresos.total}
            readOnly
          />
        </div>
        <p>Egresos:</p>
        <div className={styles.form_group}>
          <InputFormatNumber
            title={'Egreso en efectivo'}
            smallText={'Gastos en efectivo:'}
            id='expense_by_method_efectivo'
            name='expense_by_method_efectivo'
            placeholder='Egreso en efectivo'
            realAmount={
              session?.session_summary?.movements_summary?.expense_by_method
                ?.efectivo || 0
            }
            controlledValue={
              session?.session_summary?.movements_summary?.expense_by_method
                ?.efectivo || 0
            }
            readOnly
          />
          <InputFormatNumber
            title={'Egreso en transferencia'}
            smallText={'Gastos en transferencia:'}
            id='expense_by_method_transferencia'
            name='expense_by_method_transferencia'
            placeholder='Egreso en transferencia'
            realAmount={
              session?.session_summary?.movements_summary?.expense_by_method
                ?.transferencia || 0
            }
            controlledValue={
              session?.session_summary?.movements_summary?.expense_by_method
                ?.transferencia || 0
            }
            readOnly
          />
          <InputFormatNumber
            title={'Egreso total'}
            smallText={'Gastos totales:'}
            id='expense_total'
            name='expense_total'
            placeholder='Egreso total'
            realAmount={
              session?.session_summary?.movements_summary?.total_expense || 0
            }
            controlledValue={
              session?.session_summary?.movements_summary?.total_expense || 0
            }
            readOnly
          />
        </div>
        <p>Apertura y cierre de caja: </p>
        <div className={styles.form_group}>
          <InputFormatNumber
            title={'Monto de apertura'}
            smallText={'Monto con el que se abrio la caja:'}
            id='opening_amount'
            name='opening_amount'
            placeholder='Monto de apertura'
            realAmount={session?.session?.opening_amount || 0}
            controlledValue={session?.session?.opening_amount || 0}
            readOnly
            required
          />
          <InputFormatTotal
            title={'Monto de cierre'}
            id='closing_amount'
            name='closing_amount'
            realAmount={session?.session?.closing_amount || 0}
            actualAmount={Number(ingresos.total) || 0}
          />
        </div>
        <div className={styles.container_buttons}>
          <button type='button' onClick={() => setShowFormCloseCash(false)}>
            Volver al detalle
          </button>
          <button type='submit'>
            <i>
              <Close width='14px' height='14px' color='var(--marron)' />
            </i>
            Cerrar caja
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormCloseCash
