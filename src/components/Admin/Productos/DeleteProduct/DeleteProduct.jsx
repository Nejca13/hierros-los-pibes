'use client'
import Swal from 'sweetalert2'
import Delete from '@/assets/icons/Delete'
import styles from './DeleteProduct.module.css'
import { deleteProduct } from '@/services/products/products'
const DeleteProduct = ({ _id, refresh }) => {
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
        const response = await deleteProduct(_id)
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Producto eliminado',
            text: 'El producto ha sido eliminado correctamente.',
            confirmButtonColor: '#8B5E3C',
          })
          refresh()
        } else {
          throw new Error('No se pudo eliminar el producto')
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al eliminar el producto.',
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

export default DeleteProduct
