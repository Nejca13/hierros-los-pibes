'use client'
import styles from './Categorias.module.css'
import Table from '../Table/Table'
import useCategorias from '@/Hooks/useCategories'
import CreateCategoriesForm from './CreateCategoriesForm/CreateCategoriesForm'
import DeleteCategory from './DeleteCategory/DeleteCategory'
import UpdateFormCategory from './UpdateFormCategory/UpdateFormCategory'
import { useState } from 'react'
import Modal from '@/components/Modal/Modal'

const Categorias = () => {
  const { data, loading, error, refresh } = useCategorias()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategorie, setSelectedCategorie] = useState(null)

  const filteredData = data?.map((category) => ({
    Categoria: category.name,
    Icono: category.icon,
    Acciones: <DeleteCategory _id={category?._id} refresh={refresh} />,
    _original: category,
  }))

  const handleRowClick = (category) => {
    setSelectedCategorie(category)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Categorías</h1>
      <div className={styles.content}>
        <CreateCategoriesForm refresh={refresh} />
        <Table
          data={filteredData}
          loading={loading}
          onRowClick={(item) => handleRowClick(item._original)}
        />
      </div>
      <Modal isModalOpen={isModalOpen} onClose={closeModal} maxWidth='500px'>
        <UpdateFormCategory
          selectedCategorie={selectedCategorie}
          refresh={refresh}
          onClose={closeModal}
        />
      </Modal>
    </section>
  )
}

export default Categorias
