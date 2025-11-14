'use client'
import Image from 'next/image'
import useStore from '../store'
import styles from './page.module.css'
import FaCirclePlus from '@/assets/icons/FaCirclePlus'
import FaCircleMinus from '@/assets/icons/FaCircleMinus'
import Modal from '@/components/Modal/Modal'
import CreateOrdenForm from '@/components/CreateOrdenForm/CreateOrdenForm'
import { useState } from 'react'
import MercadoPago from '@/assets/icons/MercadoPago'
import Link from 'next/link'
import Swal from 'sweetalert2'

const OrdenPage = () => {
  const {
    currentUser,
    currentOrden,
    addProductToOrder,
    removeProductFromOrder,
  } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [payment, setPayment] = useState({
    mercadopago: null,
    caja: null,
  })

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleRemoveProduct = (product, quantity) => {
    if (quantity > 1) {
      removeProductFromOrder(product)
    } else {
      Swal.fire({
        title: '¿Eliminar producto?',
        text: '¿Querés eliminar este producto de la orden?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--marron)',
        cancelButtonColor: '#3085d6',
      }).then((result) => {
        if (result.isConfirmed) {
          removeProductFromOrder(product)
        }
      })
    }
  }

  return (
    <div className={styles.container}>
      <h1>Mis ordenes</h1>
      <div className={styles.content}>
        <div
          className={styles.products}
          style={
            currentOrden?.products?.length > 0
              ? { alignItems: 'flex-start' }
              : { alignItems: 'center', justifyContent: 'center' }
          }
        >
          {currentOrden?.products?.length > 0 ? (
            currentOrden.products.map((orden, idx) => {
              const product = orden.copy_object
              return (
                <div key={idx} className={styles.product}>
                  <div className={styles.productInfo}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      className={styles.productImage}
                      width={100}
                      height={100}
                    />
                    <div className={styles.info}>
                      <h4 className={styles.productTitle}>{product.name}</h4>
                      <p className={styles.productDescription}>
                        {product.description}
                      </p>
                      <span className={styles.productPrice}>
                        ${product.price} x {orden.quantity}
                      </span>
                    </div>
                  </div>
                  <div className={styles.quantity_buttons}>
                    <button
                      className={styles.button_quantity}
                      onClick={() =>
                        handleRemoveProduct(product, orden.quantity)
                      }
                    >
                      <FaCircleMinus color='black' width='16px' height='16px' />
                    </button>
                    <span className={styles.producto_cantidad}>
                      {orden.quantity}
                    </span>
                    <button
                      className={styles.button_quantity}
                      onClick={() => addProductToOrder(product)}
                    >
                      <FaCirclePlus color='black' width='16px' height='16px' />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <p className={styles.emptyCart}>No hay productos en tu orden</p>
          )}
        </div>

        <div className={styles.total}>
          {payment?.caja ? (
            <>
              <h2>Tu orden fue confirmada</h2>
              <p className={styles.success_message}>
                Tu orden fue confirmada pero aún se encuentra pendiente de pago.
                Por favor, presentate en la caja con tu pedido para poder
                abonarlo.
              </p>
            </>
          ) : (
            <>
              <h2>Total</h2>
              <div className={styles.quantity_products}>
                <span>Cantidad de productos</span>
                <strong>x{currentOrden?.quantityTotal}</strong>
              </div>
              <div className={styles.quantity_payment}>
                <span>Precio total</span>
                <strong>${currentOrden?.quantityPayment}</strong>
              </div>
            </>
          )}

          {payment.mercadopago ? (
            <Link href={payment.mercadopago} className={styles.mercado_pago}>
              <MercadoPago />
              Pagar con Mercado Pago
            </Link>
          ) : payment.caja ? (
            <Link
              href='/pedidos'
              className={styles.button}
              style={{ textAlign: 'center' }}
            >
              Ir a mis pedidos
            </Link>
          ) : (
            <button
              className={styles.button}
              disabled={currentOrden?.quantityTotal === 0}
              style={
                currentOrden?.quantityTotal === 0
                  ? { cursor: 'not-allowed' }
                  : {}
              }
              onClick={() => {
                setIsModalOpen(!isModalOpen)
              }}
            >
              Confirmar Orden
            </button>
          )}
        </div>
      </div>

      <Modal isModalOpen={isModalOpen} onClose={closeModal}>
        <CreateOrdenForm
          payment={payment}
          setPayment={setPayment}
          currentUser={currentUser?.user}
          currentOrden={currentOrden}
          closeModal={closeModal}
        />
      </Modal>
    </div>
  )
}

export default OrdenPage
