import SpinnerForm from '@/components/Spinner/SpinnerForm/SpinnerForm'
import styles from './../Reservations.module.css'
import useStore from '@/app/store'
import Image from 'next/image'
import Link from 'next/link'
import MercadoPago from '@/assets/icons/MercadoPago'
import Edit from '@/assets/icons/Edit'
import { deleteReservation } from '@/services/reservas/reservas'

const StepTwo = ({ setStep }) => {
  const { currentReservation } = useStore()

  const handleEdit = async (id_reserva) => {
    console.log(id_reserva)
    await deleteReservation(id_reserva).then((response) => {
      if (response.success) {
        setStep(1)
      }
    })
  }

  if (!currentReservation) {
    return (
      <div className={styles.container_payment}>
        <SpinnerForm />
      </div>
    )
  }

  return (
    <div className={styles.container_payment}>
      <h2>Reserva Pendiente de Pago</h2>
      <div className={styles.content_payment}>
        <div className={styles.user_information}>
          <h3>Infomación del usuario</h3>
          <div className={styles.user_info}>
            <Image
              src={currentReservation?.reservation.user?.img}
              alt='avatar'
              width={100}
              height={100}
            />
            <div className={styles.info}>
              <span>
                {currentReservation?.reservation.user?.name}{' '}
                {currentReservation?.reservation.user?.last_name}{' '}
              </span>
              <p>{currentReservation?.reservation.user?.email}</p>
              <p>{currentReservation?.reservation.user?.phone_number}</p>
            </div>
          </div>
        </div>

        <div className={styles.court_information}>
          <div className={styles.title_and_button}>
            <h3>Infomación de la cancha</h3>
            <button
              onClick={() => handleEdit(currentReservation?.reservation.id)}
            >
              <Edit /> Editar
            </button>
          </div>
          <div className={styles.court_info}>
            <div className={styles.court}>
              <span>{currentReservation?.reservation.court?.name} </span>
              <p>{currentReservation?.reservation.court?.location}</p>
              <p>{currentReservation?.reservation.court?.sport_type}</p>
              <strong>$ {currentReservation?.reservation.court?.price}</strong>
            </div>
          </div>
        </div>

        <div className={styles.detail_information}>
          <h3>Detalles de reserva</h3>
          <div className={styles.detail_info}>
            <div className={styles.detail}>
              <span>Fecha</span>
              <p>
                {new Date(
                  currentReservation?.reservation.date
                ).toLocaleDateString()}
              </p>
            </div>
            <div className={styles.detail}>
              <span>Hora</span>
              <p>
                {new Date(
                  currentReservation?.reservation.date
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </p>
            </div>
            <div className={styles.detail}>
              <span>Duración</span>
              <p>{currentReservation?.reservation.duration} minutos</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.button_mp}>
        <Link href={currentReservation?.payment_url} target='_blank'>
          {' '}
          <MercadoPago />
          Pagar con Mercado Pago
        </Link>
        <div className={styles.alert}>
          <p>
            Su reserva no se guardará hasta que no se confirme el pago de la
            cancha.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StepTwo
