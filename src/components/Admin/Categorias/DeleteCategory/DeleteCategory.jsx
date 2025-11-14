'use client'
import Swal from 'sweetalert2'
import Delete from '@/assets/icons/Delete'
import styles from './DeleteCategory.module.css'
import { deleteCategories } from '@/services/categories/categories'

const DeleteCategory = ({ _id, refresh }) => {
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
        const response = await deleteCategories(_id)
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Categoría eliminada',
            text: 'La categoría ha sido eliminada correctamente.',
            confirmButtonColor: '#8B5E3C',
          }).then(() => refresh())
        } else {
          throw new Error('No se pudo eliminar la categoría')
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al eliminar la categoría.',
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

export default DeleteCategory
