'use client'
import Swal from 'sweetalert2'
import Delete from '@/assets/icons/Delete'
import styles from './DeleteUser.module.css'
import { deleteUser } from '@/services/user/user'

const DeleteUser = ({ _id, refresh }) => {
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
        const response = await deleteUser(_id)
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            text: 'El usuario ha sido eliminado correctamente.',
            confirmButtonColor: '#8B5E3C',
          })
          refresh()
        } else {
          throw new Error('No se pudo eliminar el usuario')
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al eliminar el usuario.',
          confirmButtonColor: '#8B5E3C',
        })
      }
    }
  }

  return (
    <button onClick={handleDelete} className={styles.deleteButton}>
      <Delete color='var(--marron)' width='20px' height='20px' />
    </button>
  )
}

export default DeleteUser
