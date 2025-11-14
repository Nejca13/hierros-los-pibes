'use client'
import useSound from '@/Hooks/useSound'
import styles from './page.module.css'
import { useWebSocket } from '@/Hooks/useWebSocket'
import { useCallback, useEffect, useState } from 'react'
import { ToastContainer, Bounce, toast } from 'react-toastify'
import useRequestAudioPermission from '@/Hooks/useRequestAudioPermission'
import Image from 'next/image'
import Swal from 'sweetalert2'
import { getOrders } from '@/services/orders/orders'
import Clock from '@/assets/icons/Clock'
import Check from '@/assets/icons/Check'
import useDateTime from '@/Hooks/useDateTime'
import { formatDateAR } from '@/utils/formatedDate'

export default function KitchenPage() {
  const { fechaFormateada, horaFormateada } = useDateTime()
  useRequestAudioPermission()

  const playNotification = useSound()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const obtenerOrdenes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getOrders({
        kitchen_status: 'sent',
        sort_type: 'asc',
        limit: 2000,
      })

      if (res.success) {
        setData(res.data.orders || [])
      } else {
        console.error(res.error || 'Error al obtener órdenes')
        setData([])
      }
    } catch (error) {
      console.error('Error al obtener órdenes', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useWebSocket(
    'kitchen',
    async (data) => {
      if (data.type === 'order_sent') {
        playNotification()
        toast.info('☕ Nuevo pedido en cocina', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
          transition: Bounce,
        })
        await obtenerOrdenes()
      }
    },
    obtenerOrdenes
  )

  useEffect(() => {
    obtenerOrdenes()
    if (typeof WebSocket === 'undefined') {
      console.error('WebSocket no disponible en este navegador')
      const interval = setInterval(() => {
        obtenerOrdenes()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [obtenerOrdenes])

  const finishAndDisplay = async (orderId) => {
    Swal.fire({
      title: '¿Estás seguro que deseas marcar el pedido como finalizado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, marcar como finalizado',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `/api/orders/finish-and-display/${orderId}/`,
            { method: 'POST' }
          )

          const data = await res.json()

          if (res.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Pedido finalizado',
              text: 'El pedido fue marcado como finalizado correctamente.',
              confirmButtonColor: '#8B5E3C',
            })
            obtenerOrdenes()
          } else {
            throw new Error(data?.error || 'Error desconocido')
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al marcar como finalizado.',
            confirmButtonColor: '#8B5E3C',
          })
          console.error('Error al marcar como finalizado:', error)
        }
      }
    })
  }

  useEffect(() => {
    obtenerOrdenes()
  }, [])

  return (
    <div className={styles.container}>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
        transition={Bounce}
      />

      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.title}>
          <h3>Cocina</h3>
          <span>Pedidos activos: visualización para cocina</span>
        </div>
        <div className={styles.date}>
          <span>{fechaFormateada}</span>
          <strong>{horaFormateada}</strong>
        </div>
      </div>

      {/* Contenedor de órdenes */}
      <div
        className={styles.container_orders}
        style={
          loading || data.length === 0
            ? {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
              }
            : {}
        }
      >
        {loading ? (
          <div className={styles.loading}>Cargando pedidos...</div>
        ) : data.length === 0 ? (
          <div className={styles.loading}>No hay pedidos para cocina 🧑‍🍳</div>
        ) : (
          data.map((order, index) => (
            <div key={index} className={styles.card}>
              {/* Encabezado de la orden */}
              <div className={styles.card_header}>
                <div className={styles.title_header}>
                  <h3>
                    #{order?.pickup_number} {order?.guest_name}
                  </h3>
                  <span>
                    {order?.kitchen_status === 'sent' ? 'Pendiente' : ''}
                  </span>
                </div>
                <div className={styles.order_header}>
                  <span>{order?.table}</span>
                  <i>•</i>
                  <Clock width='14px' height='14px' />
                  <span>{formatDateAR(order?.created_at)}</span>
                </div>
              </div>

              {/* Cuerpo de la orden */}
              <div className={styles.card_body}>
                <h3>Productos:</h3>
                <ul className={styles.products_body}>
                  {order?.products_details?.map((product, i) => (
                    <li key={i}>
                      <Image
                        src={product?.image}
                        alt={product?.name}
                        width={46}
                        height={46}
                      />
                      <div className={styles.info}>
                        <div>
                          <h4>{product?.name}</h4>
                          <span>
                            $
                            {product?.unit_price?.toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <p className={styles.quantity}>
                          Cantidad: <span>x{product?.quantity}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Notas */}
                {order?.note && (
                  <div className={styles.note_body}>
                    <h4>Notas:</h4>
                    <p>{order?.note}</p>
                  </div>
                )}

                {/* Botón */}
                <div className={styles.button_body}>
                  <button onClick={() => finishAndDisplay(order?._id)}>
                    <Check width='20px' height='20px' /> Marcar como Finalizado
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
