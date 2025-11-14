'use client'
import LuOrden from '@/assets/icons/LuOrden'
import Order from '@/assets/icons/Order'
import Modal from '@/components/Modal/Modal'
import { formatDateAR } from '@/utils/formatedDate'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import Table from '../../Table/Table'
import styles from './UserActive.module.css'

const UserActive = ({ infoSession }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('desc') // orden inicial

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedMovements = useMemo(() => {
    const movements = [...(infoSession?.movements || [])]
    return movements.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })
  }, [infoSession?.movements, sortOrder])

  const filterMovements = useMemo(() => {
    return sortedMovements.map((movement) => ({
      'Tipo de movimiento': movement?.type === 'income' ? 'Ingreso' : 'Egreso',
      'Metodo de pago': movement?.payment_method,

      Monto: movement.amount.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }),
      'Fecha de creación': formatDateAR(movement?.created_at),
    }))
  }, [sortedMovements])

  return (
    <div className={styles.user_container}>
      <Image
        src={infoSession?.user_img}
        width={50}
        height={50}
        alt={infoSession?.user_name}
      />
      <div className={styles.user_info}>
        <span>{infoSession?.user_name}</span>
        <button onClick={() => setIsModalOpen(true)}>
          Ver detalles de la sesión{' '}
          <LuOrden color='white' width='12px' height='12px' />
        </button>
      </div>
      <Modal
        isModalOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth='90%'
      >
        <div className={styles.container_modal}>
          <h2>Detalles de la sesión</h2>
          <div className={styles.details}>
            <p>
              <strong>Fecha de apertura:</strong>{' '}
              {formatDateAR(infoSession?.opened_at)}
            </p>
            <p>
              <strong>Monto de apertura:</strong>{' '}
              {infoSession?.opening_amount?.toLocaleString('es-AR', {
                style: 'currency',
                currency: 'ARS',
              })}
            </p>
            <button
              className={styles.order_button}
              onClick={toggleSortOrder}
              title='Ordenar por fecha'
            >
              Ordenar
              <Order
                width='20px'
                height='20px'
                color='var(--marron)'
                rotated={sortOrder === 'asc'}
              />
            </button>
          </div>
          <Table data={filterMovements} />
        </div>
      </Modal>
    </div>
  )
}

export default UserActive
