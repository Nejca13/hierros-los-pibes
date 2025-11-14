'use client'
import { useInternalOrders } from '@/Hooks/useInternalOrders'
import styles from './OrdenesInternas.module.css'
import { formatDateAR } from '@/utils/formatedDate'
import Badge from '@/components/Badge/Badge'
import Table from '../Table/Table'
import Pagination from '../Pagination/Pagination'
import Filters from './Filters/Filters'
import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import DetailProducts from './DetailProducts/DetailProducts'

const OrdenesInternas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    refresh,
  } = useInternalOrders()

  //calculos de paginado
  const totalOrders = data?.total || 0
  const totalPages = Math.ceil(totalOrders / filters.limit)

  //funcion para abrir modal y setear _orignal
  const handleOpenModal = (order) => {
    setIsModalOpen(true)
    setSelectedProduct(order)
  }

  //filtro de datos para la tabla
  const filteredData = data?.orders?.map((order) => ({
    'Nombre del empleado': order?.guest_name,
    'Fecha de creación': formatDateAR(order?.created_at),
    'Metodo de pago': order?.payment_method,
    'Monto total': '$' + order?.total,
    'Productos consumidos': (
      <Badge
        bg='rgb(52, 52, 52)'
        onClick={() => {
          handleOpenModal(order?.products_details)
        }}
      >
        Ver detalles
      </Badge>
    ),
    _original: order,
  }))

  console.log(selectedProduct)

  return (
    <section className={styles.container}>
      <div className={styles.title_button}>
        <h1 className={styles.title}>Ordenes internas</h1>
      </div>
      <Filters updateFilter={updateFilter} resetFilters={resetFilters} />
      <div className={styles.content}>
        <Table data={filteredData} loading={loading} error={error} />
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
      <Modal
        isModalOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth='500px'
      >
        <DetailProducts selectedProduct={selectedProduct} />
      </Modal>
    </section>
  )
}

export default OrdenesInternas
