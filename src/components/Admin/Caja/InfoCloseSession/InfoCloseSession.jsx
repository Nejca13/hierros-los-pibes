'use client'
import { useEffect, useMemo, useState } from 'react'
import Table from '../../Table/Table'
import styles from './InfoCloseSession.module.css'
import Order from '@/assets/icons/Order'
import Image from 'next/image'
import { formatDateAR } from '@/utils/formatedDate'
import { formatCurrencyARS } from '@/utils/formatCurrency'
import Spinner from '@/components/Spinner/Spinner'
import provisory_img from '@/assets/images/user.webp'
import Close from '@/assets/icons/Close'

const InfoCloseSession = ({ session_id, setShowFormCloseCash }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc')

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

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedMovements = useMemo(() => {
    const movements = [...(session?.session?.movements || [])]
    return movements.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })
  }, [session?.session?.movements, sortOrder])

  const filterMovements = useMemo(() => {
    return sortedMovements.map((movement) => ({
      'Tipo de movimiento': movement?.type === 'income' ? 'Ingreso' : 'Egreso',
      'Metodo de pago': movement?.payment_method,
      Monto: movement.amount.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }),
      'Fecha de creación': formatDateAR(movement.created_at),
    }))
  }, [sortedMovements])

  useEffect(() => {
    if (session_id) {
      getSession()
    }
  }, [])

  return (
    <div
      className={styles.container_modal}
      style={
        loading
          ? { display: 'flex', justifyContent: 'center', alignItems: 'center' }
          : {}
      }
    >
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          <h2>
            <Image
              src={session?.session?.user_img || provisory_img}
              width={40}
              height={40}
              alt='imagen_user'
            />{' '}
            Detalles de sesión ({session?.session?.user_name})
            <button
              className={styles.order_button}
              onClick={toggleSortOrder}
              title='Ordenar por fecha'
            >
              Ordenar tabla
              <Order
                width='15px'
                height='15px'
                color='var(--marron)'
                rotated={sortOrder === 'asc'}
              />
            </button>
          </h2>
          <div className={styles.details}>
            <p>
              <strong>Fecha de apertura:</strong>{' '}
              <span>{formatDateAR(session?.session?.opened_at)}</span>
            </p>
            <p>
              <strong>Fecha de cierre:</strong>
              <span>La sesión se ecuentra activa</span>
            </p>
            <p>
              <strong>Ingresos:</strong>{' '}
              <span>
                {`Efectivo: ${formatCurrencyARS(session?.session_summary?.movements_summary?.income_by_method?.efectivo)}`}
                <br />
                {`Transferencia: ${formatCurrencyARS(session?.session_summary?.movements_summary?.income_by_method?.transferencia)}`}
                <br />
                {`Total: ${formatCurrencyARS(session?.session_summary?.movements_summary?.total_income)}`}
              </span>
            </p>
            <p>
              <strong>Egresos:</strong>{' '}
              <span>
                {`Efectivo: ${formatCurrencyARS(session?.session_summary?.movements_summary?.expense_by_method?.efectivo)}`}
                <br />
                {`Transferencia: ${formatCurrencyARS(session?.session_summary?.movements_summary?.expense_by_method?.transferencia)}`}
                <br />
                {`Total: ${formatCurrencyARS(session?.session_summary?.movements_summary?.total_expense)}`}
              </span>
            </p>
            <p>
              <strong>Monto de apertura:</strong>{' '}
              <span>{formatCurrencyARS(session?.session?.opening_amount)}</span>
            </p>
            <p>
              <strong>Monto de cierre:</strong>{' '}
              <span>{formatCurrencyARS(session?.session?.closing_amount)}</span>
            </p>
          </div>
          <Table data={filterMovements} minHeigth='192px' />
          <div className={styles.container_button}>
            <button onClick={() => setShowFormCloseCash(true)}>
              <i>
                <Close width='14px' height='14px' color='white' />
              </i>
              Comparar y cerrar caja
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default InfoCloseSession
