'use client'
import SpinnerForm from '@/components/Spinner/SpinnerForm/SpinnerForm'
import styles from './CourtList.module.css'
import { deleteCourt } from '@/services/courts/court'
import Swal from 'sweetalert2'
import UpdateFormCourt from './UpdateFormCourt/UpdateFormCourt'
import { useState } from 'react'
import Modal from '@/components/Modal/Modal'

const CourtList = ({ courts, obtenerCanchas }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [courtToUpdate, setCourtToUpdate] = useState(null)

  const closeModal = () => setIsModalOpen(false)

  const openModalUpdate = (curt_update) => {
    setIsModalOpen(true)
    setCourtToUpdate(curt_update)
  }

  const eliminarCancha = async (_id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteCourt(_id)
          .then((response) => {
            console.log(response.data)
            Swal.fire(
              '¡Eliminado!',
              'La cancha ha sido eliminada exitosamente.',
              'success'
            )
            obtenerCanchas()
          })
          .catch((error) => {
            console.error('Error al eliminar la cancha:', error)
            Swal.fire(
              'Error',
              'Hubo un problema al eliminar la cancha.',
              'error'
            )
          })
      }
    })
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cancha</th>
            <th>Ubicación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courts.length > 0 ? (
            courts.map((court, index) => (
              <tr key={index}>
                <td>{court.name}</td>
                <td>{court.location}</td>
                <td>
                  <button onClick={() => openModalUpdate(court)}>Editar</button>
                  <button onClick={() => eliminarCancha(court._id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr className={styles.spinner}>
              <td>
                <SpinnerForm />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Modal isModalOpen={isModalOpen} onClose={closeModal}>
        <UpdateFormCourt
          courtToUpdate={courtToUpdate}
          closeModal={closeModal}
          obtenerCanchas={obtenerCanchas}
        />
      </Modal>
    </div>
  )
}

export default CourtList
