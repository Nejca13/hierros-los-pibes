'use client'
import Ticket from '@/assets/icons/Ticket'
import styles from './TicketPreview.module.css'
import { formatDateAR } from '@/utils/formatedDate'
import { formatCurrencyARS } from '@/utils/formatCurrency'
import HotDog from '@/assets/icons/HotDog'
import { useReactToPrint } from 'react-to-print'
import { useEffect, useRef } from 'react'

const TicketPreview = ({
  selectedOrder,
  setOrderToPrint,
  autoPrint = false,
  onClose,
}) => {
  const contentRef = useRef(null)

  const reactToPrintFn = useReactToPrint({
    contentRef: contentRef,
    onAfterPrint: () => {
      onClose()
      setOrderToPrint(null)
    },
  })

  useEffect(() => {
    if (selectedOrder && autoPrint) {
      console.log('por imprimir')
      reactToPrintFn()
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.ticket} ref={contentRef}>
        <h1>
          <HotDog color='black' width='20px' height='20px' />
          PANCHOS222
        </h1>
        <div className={styles.info_order}>
          <span>
            <strong>Nº DE ORDEN:</strong>{' '}
            <p style={{ fontWeight: '600' }}>
              #{selectedOrder?.pickup_number?.toString().slice(-2)}
            </p>
          </span>
          <span>
            <strong>NOMBRE DEL CLIENTE:</strong>{' '}
            <p>{selectedOrder?.guest_name}</p>
          </span>
          <span>
            <strong>FECHA:</strong>{' '}
            <p>{formatDateAR(selectedOrder?.created_at)}</p>
          </span>
          <span>
            <strong>ATENDIDO POR:</strong>{' '}
            <p>{selectedOrder?.attended_by_user?.name}</p>
          </span>
        </div>

        <div className={styles.products}>
          <ul>
            {selectedOrder?.products_details.map((product, index) => (
              <li key={index}>
                <strong>{product?.name}</strong>
                <p>
                  {formatCurrencyARS(product?.unit_price)} x{product?.quantity}
                </p>
              </li>
            ))}
          </ul>
          <span className={styles.total}>
            <strong>TOTAL: {formatCurrencyARS(selectedOrder?.total)}</strong>
          </span>
        </div>

        <div className={styles.payment_method}>
          <strong>METODO DE PAGO:</strong>
          <p>{selectedOrder?.payment_method}</p>
        </div>

        <div className={styles.end_ticket}>
          <small>
            ¡Gracias por su compra!
            <br />
          </small>
          <span>CLAVE BAÑO: 141414#</span>
        </div>
      </div>

      <button onClick={reactToPrintFn}>
        <Ticket stroke='white' /> Imprimir ticket de compra
      </button>
    </div>
  )
}

export default TicketPreview
