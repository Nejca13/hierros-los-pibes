'use client'
import { useCallback, useEffect, useState } from 'react'
import styles from './page.module.css'
import { getOrders } from '@/services/orders/orders'
import Image from 'next/image'
import useSound from '@/Hooks/useSound'
import useRequestAudioPermission from '@/Hooks/useRequestAudioPermission'
import { useWebSocket } from '@/Hooks/useWebSocket'
import useDateTime from '@/Hooks/useDateTime'
import Check from '@/assets/icons/Check'

const CustomerPage = () => {
  useRequestAudioPermission()

  const playNotification = useSound()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { fechaFormateada, horaFormateada } = useDateTime()

  const obtenerOrdenes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getOrders({
        kitchen_status: 'finished',
        sort_type: 'desc',
        limit: 4,
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
    'screen',
    async (data) => {
      if (data.type === 'display_pickup') {
        playNotification()
        await obtenerOrdenes()
      }
    },
    obtenerOrdenes
  )
  useEffect(() => {
    if (!window.WebSocket || !window.fetch || !window.Promise) {
      window.location.href = '/customer/customer.html'
    }

    obtenerOrdenes()
    if (typeof WebSocket === 'undefined') {
      console.error('WebSocket no disponible en este navegador')
      const interval = setInterval(() => {
        obtenerOrdenes()
      }, 5000) // cada 5 segundos

      return () => clearInterval(interval)
    }
  }, [])

  return (
    <div className={styles.container}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.title}>
          <h3>Cliente</h3>
          <span>Visualización de pedidos para retiro</span>
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
          <div className={styles.loading}>Cargando ordenes para retirar...</div>
        ) : data.length === 0 ? (
          <div className={styles.loading}>No hay pedidos para retirar ✅</div>
        ) : (
          data.map((order, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.number_and_name}>
                <span>#{order?.pickup_number}</span>
                <div className={styles.title_name}>
                  <p>Cliente</p>
                  <h3>{order?.guest_name}</h3>
                </div>
              </div>
              <div className={styles.bagde_and_date}>
                <span className={styles.order_complete}>
                  <Check color='#186337' width='25px' height='25px' /> Listo
                  para retirar
                </span>
                <small>17:20pm</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CustomerPage
