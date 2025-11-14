'use client'
import { useEffect, useState } from 'react'
import styles from './Desperdicios.module.css'
import Waste from '@/assets/icons/Waste'
import Modal from '@/components/Modal/Modal'
import CreateWasteForm from './CreateWasteForm/CreateWasteForm'
import ImageAndName from '../ImageAndName/ImageAndName'
import { formatDateAR } from '@/utils/formatedDate'
import Table from '../Table/Table'

const Desperdicios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [wasteData, setWasteData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const obtenerDesperdicios = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products-waste/')
      if (!response.ok) {
        throw new Error('Error al obtener los desperdicios')
      }
      const data = await response.json()
      setWasteData(data)
    } catch (error) {
      console.error('Error fetching waste data:', error)
    } finally {
      setLoading(false)
    }
  }

  console.log('wasteData', wasteData)

  useEffect(() => {
    obtenerDesperdicios()
  }, [])

  const filteredData = wasteData?.wastes?.map((product) => ({
    Nombre: (
      <ImageAndName image={product.product_image} name={product.product_name} />
    ),
    'Fecha de creación': formatDateAR(product.created_at),
    Cantidad: product.quantity,
    Razon: product.reason,
    _original: product,
  }))

  return (
    <section className={styles.container}>
      <div className={styles.title_button}>
        <h1 className={styles.title}>Desperdicios (Productos)</h1>
        <button
          className={styles.create_button}
          onClick={() => setIsModalOpen(true)}
        >
          <Waste color='var(--marron)' width='18px' height='18px' />
          Crear Desperdicio
        </button>
      </div>

      <div className={styles.content}>
        <Table data={filteredData} loading={loading} />
      </div>

      <Modal
        isModalOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth='500px'
      >
        <CreateWasteForm
          onClose={() => setIsModalOpen(false)}
          refresh={() => obtenerDesperdicios()}
        />
      </Modal>
    </section>
  )
}

export default Desperdicios
