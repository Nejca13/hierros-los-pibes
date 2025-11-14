'use client'
import styles from './page.module.css'
import { useEffect, useState } from 'react'
import ShoppingBag from '@/assets/icons/ShoppingBag'
import Calendar from '@/assets/icons/Calendar'
import Clock from '@/assets/icons/Clock'
import Box from '@/assets/icons/Box'
import Badge from '@/components/Badge/Badge'
import CreditCard from '@/assets/icons/CreditCard'
import Email from '@/assets/icons/Email'
import Note from '@/assets/icons/Note'
import OpenEye from '@/assets/icons/OpenEye'
import LinkPay from '@/assets/icons/LinkPay'
import Image from 'next/image'
import { getOrders } from '@/services/orders/orders'

const PedidosPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detail, setDetail] = useState([])

  const formatOrderId = (id) => {
    return id.slice(-6)
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge bg='#81D8AE'>Pagado</Badge>
      case 'pending':
        return <Badge bg='#F6DD72'>Pendiente</Badge>
      case 'failed':
        return <Badge bg='#F3A6A6'>Cancelado</Badge>
      default:
        return <Badge bg='var(--marron)'>{status}</Badge>
    }
  }

  const getTotalProducts = (products) => {
    return products.reduce((total, product) => total + product.quantity, 0)
  }

  const toggleDetail = (orderId) => {
    if (detail.includes(orderId)) {
      setDetail(detail.filter((id) => id !== orderId))
    } else {
      setDetail([...detail, orderId])
    }
  }

  const formatLocalTime = (isoDateStr) => {
    const utcDate = new Date(isoDateStr)
    const argentinaDate = new Date(utcDate.getTime() - 3 * 60 * 60 * 1000)
    return argentinaDate.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  useEffect(() => {
    const user_id = localStorage.getItem('user_id')
    const guest_email = localStorage.getItem('guest_email')

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      let filters = {}

      if (user_id) {
        filters = { user_id }
      } else if (guest_email) {
        filters = { guest_email }
      } else {
        setData(null)
        setLoading(false)
        return
      }

      try {
        const response = await getOrders(filters)
        if (response.success) {
          setData(response.data)
        } else {
          setError(response.error || 'Error al cargar órdenes')
        }
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading)
    return <div className={styles.container_messages}>Cargando pedidos...</div>
  if (error)
    return <div className={styles.container_messages}>Error: {error}</div>
  if (!data || data.orders.length === 0)
    return (
      <div className={styles.container_messages}>
        Aún no has realizado pedidos
      </div>
    )

  console.log(data)

  return (
    <div className={styles.container}>
      <h1>Mis pedidos</h1>
      <div className={styles.content}>
        {data?.orders?.map((order, index) => (
          <div key={index} className={styles.orderCard}>
            <div className={styles.header_card}>
              <div className={styles.col_1}>
                <strong>
                  <ShoppingBag
                    color='var(--marron)'
                    width='20px'
                    height='20px'
                  />
                  {`Pedido #${formatOrderId(order._id)}`}
                </strong>
                <div className={styles.date_container}>
                  <span>
                    <Calendar
                      color='var(--marron)'
                      width='16px'
                      height='16px'
                    />
                    {new Intl.DateTimeFormat('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(order.created_at))}
                  </span>
                  <span>
                    <Clock color='var(--marron)' width='16px' height='16px' />
                    {formatLocalTime(order.created_at)}
                  </span>
                </div>
              </div>
              <div className={styles.col_2}>
                {getStatusBadge(order.status)}
                <strong>${order.total.toLocaleString()}</strong>
              </div>
            </div>
            <div className={styles.content_card}>
              <div className={styles.number_product_and_method}>
                <span>
                  <Box color='var(--marron)' width='16px' height='16px' />
                  Productos:
                  <p>{getTotalProducts(order.products)}</p>
                </span>
                <span>
                  <CreditCard
                    color='var(--marron)'
                    width='16px'
                    height='16px'
                  />
                  Metodo de pago:
                  <p>{order.payment_method}</p>
                </span>
              </div>
              <div className={styles.email_note}>
                <span>
                  <Email color='var(--marron)' width='16px' height='16px' />
                  Email:
                  <p>{order.guest_email}</p>
                </span>
                {order.note && (
                  <span>
                    <Note color='var(--marron)' width='16px' height='16px' />
                    Nota:
                    <p>{order.note}</p>
                  </span>
                )}
              </div>
            </div>
            {detail?.includes(order._id) && (
              <div className={styles.detail_card}>
                <h3>Detalles de los produtos</h3>
                {order?.products_details.map((product, index) => (
                  <div key={index} className={styles.product_container}>
                    <div className={styles.info_product}>
                      <Image
                        src={product.image}
                        width={50}
                        height={50}
                        alt='imagen_del_producto'
                      />
                      <span>
                        {product.name} x {product.quantity}
                      </span>
                    </div>
                    <span>${product.total_price}</span>
                  </div>
                ))}
                <h4>Información adicional</h4>
                <div className={styles.info_aditional}>
                  <span>
                    Nombre:
                    <p>{order?.guest_name}</p>
                  </span>
                  <span>
                    Mesa/Ubicación:
                    <p>{order?.table}</p>
                  </span>
                </div>
              </div>
            )}
            <div className={styles.buttons_card}>
              <button onClick={() => toggleDetail(order._id)}>
                <OpenEye width='18px' height='18px' color='var(--marron)' />
                Ver detalles
              </button>
              {order?.status === 'pending' &&
                order.payment_method === 'mercadopago' && (
                  <button
                    onClick={() => window.open(order.payment_url, '_blank')}
                  >
                    <LinkPay width='18px' height='18px' />
                    Pagar
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PedidosPage
