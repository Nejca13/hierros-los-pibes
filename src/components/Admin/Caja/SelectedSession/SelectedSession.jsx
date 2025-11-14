'use client'
import { useMemo, useState } from 'react'
import Table from '../../Table/Table'
import styles from './SelectedSession.module.css'
import Order from '@/assets/icons/Order'
import Image from 'next/image'
import { formatDateAR } from '@/utils/formatedDate'
import { formatCurrencyARS } from '@/utils/formatCurrency'

const SelectedSession = ({ session, summary }) => {
  const [sortOrder, setSortOrder] = useState('desc') // orden inicial

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedMovements = useMemo(() => {
    const movements = [...(session?.movements || [])]
    return movements.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })
  }, [session?.movements, sortOrder])

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

  console.log(summary)

  return (
    <div className={styles.container_modal}>
      <h2>
        <Image
          src={session?.user_img}
          width={40}
          height={40}
          alt='imagen_user'
        />{' '}
        Detalles de sesión ({session?.user_name})
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
          <span>{formatDateAR(session?.opened_at)}</span>
        </p>
        <p>
          <strong>Fecha de cierre:</strong>
          <span>{formatDateAR(session?.closed_at)}</span>
        </p>
        <p>
          <strong>Ingresos:</strong>{' '}
          <span>
            {`Efectivo: ${formatCurrencyARS(summary?.movements_summary?.income_by_method?.efectivo)}`}
            <br />
            {`Transferencia: ${formatCurrencyARS(summary?.movements_summary?.income_by_method?.transferencia)}`}
            <br />
            {`Total: ${formatCurrencyARS(summary?.movements_summary?.total_income)}`}
          </span>
        </p>
        <p>
          <strong>Egresos:</strong>{' '}
          <span>
            {`Efectivo: ${formatCurrencyARS(summary?.movements_summary?.expense_by_method?.efectivo)}`}
            <br />
            {`Transferencia: ${formatCurrencyARS(summary?.movements_summary?.expense_by_method?.transferencia)}`}
            <br />
            {`Total: ${formatCurrencyARS(summary?.movements_summary?.total_expense)}`}
          </span>
        </p>
        <p>
          <strong>Monto de apertura:</strong>{' '}
          <span>{formatCurrencyARS(session?.opening_amount)}</span>
        </p>
        <p>
          <strong>Monto de cierre:</strong>{' '}
          <span>{formatCurrencyARS(session?.closing_amount)}</span>
        </p>
      </div>
      {summary?.closing_note && (
        <div className={styles.diff}>
          <p>
            <strong>Diferencia: </strong> <span>{summary?.closing_note}</span>
          </p>
        </div>
      )}
      <Table data={filterMovements} minHeigth='192px' />
    </div>
  )
}

export default SelectedSession
