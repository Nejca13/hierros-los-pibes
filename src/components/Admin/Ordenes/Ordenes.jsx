'use client'
import { useOrders } from '@/Hooks/useOrders'
import styles from './Ordenes.module.css'
import Table from '../Table/Table'
import Badge from '@/components/Badge/Badge'
import FaCirclePlus from '@/assets/icons/FaCirclePlus'
import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import CreateOrdenForm from './CreateOrdenForm/CreateOrdenForm'
import DeleteOrder from './DeleteOrder/DeleteOrder'
import Pagination from '../Pagination/Pagination'
import Filters from './Filters/Filters'
import { useWebSocket } from '@/Hooks/useWebSocket'
import useRequestAudioPermission from '@/Hooks/useRequestAudioPermission'
import useSound from '@/Hooks/useSound'
import { formatDateAR } from '@/utils/formatedDate'
import TicketPreview from './TicketPreview/TicketPreview'
import Printer from '@/assets/icons/Printer'

const Ordenes = () => {
  useRequestAudioPermission()
  const playNotification = useSound()
  const { data, loading, error, filters, updateFilter, resetFilters, refresh } =
    useOrders()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [type, setType] = useState('create')

  //estado para guardar el ticket para imprimir
  const [orderToPrint, setOrderToPrint] = useState(null)

  const totalOrders = data?.total || 0
  const totalPages = Math.ceil(totalOrders / filters.limit)

  useWebSocket('orders', (data) => {
    console.log('ORDENES WS', data)

    if (data.type === 'new_order') {
      playNotification()
      refresh() // vuelve a llamar al hook de órdenes
    }
    if (data.type === 'order_finished') {
      refresh() // vuelve a llamar al hook de órdenes
    }
  })

  const handleRowClick = (order, type) => {
    console.log(order, type)
    setType(type)
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
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

  const getStatusKitchen = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge bg='#F6DD72'>Pendiente</Badge>
      case 'sent':
        return <Badge bg='#81D8AE'>Enviado</Badge>
      case 'finished':
        return <Badge bg='deepskyblue'>Finalizado</Badge>
      default:
        return 'sin estado'
    }
  }

  const filteredData = data?.orders?.map((order) => ({
    Nº: '#' + order?.pickup_number,
    Nombre: order?.guest_name,
    'Fecha de compra': formatDateAR(order.created_at),
    'Metodo de pago': order?.payment_method,
    'Origen del pago': order?.payment_origin,
    'Estado del pago': getStatusBadge(order?.status),
    Cocina: getStatusKitchen(order?.kitchen_status),
    Acciones: (
      <div className={styles.button_actions}>
        <DeleteOrder
          _id={order?._id}
          refresh={refresh}
          cancelled={order?.cancelled}
        />
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRowClick(order, 'preview')
          }}
        >
          <Printer color='var(--marron)' width='20px' height='20px' />
        </button>
      </div>
    ),

    _original: order,
  }))

  return (
    <section className={styles.container}>
      <div className={styles.title_button}>
        <h1 className={styles.title}>Ordenes</h1>
        <button
          onClick={() => {
            setType('create')
            setIsModalOpen(true)
          }}
        >
          <FaCirclePlus width='20px' height='20px' color='var(--marron)' />
          Crear Orden
        </button>
      </div>
      <Filters
        updateFilter={updateFilter}
        filters={filters}
        resetFilters={resetFilters}
      />
      <div className={styles.content}>
        <Table
          data={filteredData}
          loading={loading}
          onRowClick={(item) => handleRowClick(item._original, 'create')}
        />
        <Pagination
          page={filters.page}
          totalPages={totalPages}
          limit={filters.limit}
          onPageChange={(newPage) => updateFilter('page', newPage)}
          onLimitChange={(newLimit) => {
            updateFilter('limit', newLimit)
            updateFilter('page', 1)
          }}
        />
      </div>
      <Modal isModalOpen={isModalOpen} onClose={closeModal} maxWidth='90%'>
        {type === 'create' && (
          <CreateOrdenForm
            onClose={closeModal}
            refresh={refresh}
            selectedOrder={selectedOrder}
            setOrderToPrint={setOrderToPrint}
          />
        )}
        {type === 'preview' && (
          <TicketPreview
            onClose={closeModal}
            refresh={refresh}
            selectedOrder={selectedOrder}
            setOrderToPrint={setOrderToPrint}
          />
        )}
      </Modal>

      {orderToPrint && (
        <div className={styles.printTicket}>
          <TicketPreview
            selectedOrder={orderToPrint}
            autoPrint={true}
            setOrderToPrint={setOrderToPrint}
          />
        </div>
      )}
    </section>
  )
}

export default Ordenes
