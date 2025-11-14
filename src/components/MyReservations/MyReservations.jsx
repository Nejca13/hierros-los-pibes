'use client'
import { useEffect, useState } from 'react'
import styles from './MyReservations.module.css'
import useStore from '@/app/store'
import {
  deleteReservation,
  getReservationById,
} from '@/services/reservas/reservas'
import Image from 'next/image'
import Link from 'next/link'
import Swal from 'sweetalert2'

const MyReservations = () => {
  const [activeButton, setActiveButton] = useState('pending')
  const [reservations, setReservations] = useState([])

  const { currentUser } = useStore()

  const reservacionesPorId = async (user_id) => {
    await getReservationById(user_id)
      .then((response) => {
        if (response.success) {
          console.log(response.data)
          setReservations(response.data)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const eliminarReserva = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la reserva de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      await deleteReservation(id)
        .then((response) => {
          if (response.success) {
            Swal.fire({
              title: 'Eliminado',
              text: 'La reserva ha sido eliminada correctamente.',
              icon: 'success',
              confirmButtonColor: '#3085d6',
            })
            reservacionesPorId(currentUser.user.id)
          }
        })
        .catch((error) => {
          console.error(error)
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar la reserva. Inténtalo nuevamente.',
            icon: 'error',
            confirmButtonColor: '#d33',
          })
        })
    }
  }

  useEffect(() => {
    if (currentUser) {
      reservacionesPorId(currentUser.user.id)
    }
  }, [currentUser])

  // Filtrar reservas según el estado activo
  const filteredReservations = reservations.filter(
    (reservation) => reservation.status === activeButton
  )

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Mis Reservas</h2>
        <div className={styles.control_buttons}>
          <button
            onClick={() => setActiveButton('pending')}
            className={`${styles.button} ${activeButton === 'pending' ? styles.active : ''}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setActiveButton('confirmed')}
            className={`${styles.button} ${activeButton === 'confirmed' ? styles.active : ''}`}
          >
            Pagadas
          </button>
        </div>

        <div className={styles.container_reservations}>
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation, index) => (
              <div className={styles.reservation} key={index}>
                <h3>{reservation.court.name}</h3>
                <div className={styles.info_reservation}>
                  <Image
                    src={reservation.court.image}
                    alt={reservation.court.name}
                    width={200}
                    height={200}
                  />

                  <div className={styles.info}>
                    <p>
                      <strong>Tipo de deporte:</strong>{' '}
                      {reservation.court.sport_type.charAt(0).toUpperCase() +
                        reservation.court.sport_type.slice(1)}
                    </p>
                    <p>
                      <strong>Ubicación:</strong> {reservation.court.location}
                    </p>
                    <p>
                      <strong>Fecha y Hora:</strong>{' '}
                      {new Date(reservation.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                      ,{' '}
                      {new Date(reservation.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>
                      <strong>Duración del turno:</strong>{' '}
                      {reservation.duration} min
                    </p>
                    <p
                      style={{
                        color:
                          reservation.status === 'pending'
                            ? '#EAB308'
                            : 'var(--green)',
                        fontWeight: 'semibold',
                      }}
                    >
                      <strong>Estado de pago:</strong>{' '}
                      {reservation.status.charAt(0).toUpperCase() +
                        reservation.status.slice(1)}
                    </p>
                    <p>
                      <strong>Precio total:</strong> $
                      {reservation.court.price.toLocaleString()}
                    </p>
                  </div>

                  <div className={styles.info_reservation}>
                    {reservation.status === 'pending' ? (
                      <>
                        <Link
                          href={reservation?.payment_url}
                          className={styles.button_link}
                          target='_blank'
                        >
                          Pagar
                        </Link>
                        <button
                          className={styles.button_cancel}
                          onClick={() => eliminarReserva(reservation._id)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.no_reservations}>
              {activeButton === 'pending'
                ? 'No tienes reservas pendientes.'
                : 'No tienes reservas pagadas.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyReservations
