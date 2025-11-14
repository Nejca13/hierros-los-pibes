'use client'
import Swal from 'sweetalert2'
import Delete from '@/assets/icons/Delete'
import styles from './DeleteOrder.module.css'
import { updateOrder } from '@/services/orders/orders'
import Badge from '@/components/Badge/Badge'

const DeleteOrder = ({ _id, refresh, cancelled }) => {
  const handleDelete = async (e) => {
    e.stopPropagation()
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás deshacer esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8B5E3C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      try {
        // Solo actualizar el estado a cancelado
        const response = await updateOrder(_id, {
          cancelled: true,
          status: 'failed',
          sent_to_kitchen: false,
          displayed_to_client: false,
          kitchen_status: 'pending',
        })
        if (response) {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El producto ha sido eliminado.',
            confirmButtonColor: '#8B5E3C',
          })
          refresh()
        }
      } catch (error) {
        console.error('Error al eliminar el producto:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el producto.',
          confirmButtonColor: '#8B5E3C',
        })
      }
    }
  }

  return (
    <>
      {cancelled ? (
        <Badge bg='red'>Cancelado</Badge>
      ) : (
        <button onClick={handleDelete} className={styles.deleteButton}>
          <Delete color='var(--marron)' width='20px' height='20px' />
        </button>
      )}
    </>
  )
}

export default DeleteOrder
