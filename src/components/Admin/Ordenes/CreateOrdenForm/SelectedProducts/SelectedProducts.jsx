import FaSquareMinus from '@/assets/icons/FaSquareMinus'
import styles from './SelectedProducts.module.css'
import FaSquarePlus from '@/assets/icons/FaSquarePlus'
import Image from 'next/image'
import Swal from 'sweetalert2'

const SelectedProducts = ({ selectedProducts, setSelectedProducts }) => {
  //incrementar prod
  const handleIncrease = (product_id) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.product_id === product_id ? { ...p, quantity: p.quantity + 1 } : p
      )
    )
  }

  //decrementar prod
  const handleDecrease = (product_id) => {
    setSelectedProducts((prev) => {
      const product = prev.find((p) => p.product_id === product_id)

      if (product.quantity > 1) {
        return prev.map((p) =>
          p.product_id === product_id ? { ...p, quantity: p.quantity - 1 } : p
        )
      } else {
        // Confirmación antes de eliminar
        Swal.fire({
          title: '¿Eliminar producto?',
          text: `¿Querés eliminar "${product.name}" del pedido?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            setSelectedProducts(prev.filter((p) => p.product_id !== product_id))
          }
        })

        return prev // No cambia nada hasta que confirme
      }
    })
  }

  //total prod
  const totalQuantity = selectedProducts.reduce(
    (acc, item) => acc + item.quantity,
    0
  )
  //total precio
  const totalPrice = selectedProducts.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  )

  return (
    <div className={styles.selected_products_container}>
      <p>Productos seleccionados:</p>
      <div className={styles.container_items}>
        {selectedProducts.map((p) => (
          <div key={p.product_id} className={styles.selected_product_item}>
            <div className={styles.image_name_product}>
              <Image src={p?.image} width={20} height={20} alt={p.name} />
              <span>{p.name}</span>
            </div>
            <div className={styles.buttons}>
              <button
                type='button'
                onClick={() => handleDecrease(p.product_id)}
              >
                <FaSquareMinus color='var(--marron)' width='20' height='20' />
              </button>
              <span>{p.quantity}</span>
              <button
                type='button'
                onClick={() => handleIncrease(p.product_id)}
              >
                <FaSquarePlus color='var(--marron)' width='20' height='20' />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.quantity}>
          <span>Total de productos:</span>{' '}
          <strong>{`x${totalQuantity}`}</strong>
        </div>
        <div className={styles.price}>
          <span>Total a pagar:</span> <strong>{totalPrice.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  )
}

export default SelectedProducts
