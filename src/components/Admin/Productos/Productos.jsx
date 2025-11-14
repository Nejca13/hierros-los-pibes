'use client'
import { useState } from 'react'
import { useProducts } from '@/Hooks/useProducts'
import CreateProductsForm from './CreateProductsForm/CreateProductsForm'
import styles from './Productos.module.css'
import Table from '../Table/Table'
import ImageAndName from '../ImageAndName/ImageAndName'
import Modal from '@/components/Modal/Modal'
import UpdateFormProduct from './UpdateFormProduct/UpdateFormProduct'
import DeleteProduct from './DeleteProduct/DeleteProduct'
import Filters from './Filters/Filters'
import Waste from '@/assets/icons/Waste'

const Productos = () => {
  const { data, loading, error, refresh, updateFilter, resetFilters } =
    useProducts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const handleRowClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedProduct(null)
    setIsModalOpen(false)
  }

  const filteredData = data?.productos?.map((product) => ({
    Nombre: <ImageAndName image={product.image} name={product.name} />,
    Precio: `$${product.price}`,
    Stock: product.inventory_count,
    Disponible: product.available ? 'Sí' : 'No',
    Acciones: <DeleteProduct _id={product._id} refresh={refresh} />,
    _original: product,
  }))

  return (
    <section className={styles.container}>
      <div className={styles.title_button}>
        <h1 className={styles.title}>Productos</h1>
      </div>
      <Filters updateFilter={updateFilter} resetFilters={resetFilters} />
      <div className={styles.content}>
        <CreateProductsForm refresh={refresh} />
        <Table
          data={filteredData}
          loading={loading}
          onRowClick={(item) => handleRowClick(item._original)}
        />
      </div>
      <Modal isModalOpen={isModalOpen} onClose={closeModal} maxWidth='700px'>
        <UpdateFormProduct
          product={selectedProduct}
          closeModal={closeModal}
          refresh={refresh}
        />
      </Modal>
    </section>
  )
}

export default Productos
