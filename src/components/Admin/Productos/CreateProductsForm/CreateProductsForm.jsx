'use client'
import styles from './CreateProductsForm.module.css'
import { useState } from 'react'
import Spinner from '@/components/Spinner/Spinner'
import { createProduct } from '@/services/products/products'
import Swal from 'sweetalert2'
import useCategorias from '@/Hooks/useCategories'

const CreateProductsForm = ({ refresh }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { data } = useCategorias()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = Object.fromEntries(new FormData(e.target))
    await createProduct(formData)
      .then((response) => {
        if (!response.success) {
          console.error('Error al crear el producto:', response.error)
          setError(response.detail)
          return
        }

        Swal.fire({
          icon: 'success',
          title: 'Producto creado',
          text: 'El producto se creó correctamente.',
          confirmButtonColor: '#8B5E3C', // opcional: un marrón para combinar con tu estilo
        })

        e.target.reset()
        refresh()
      })
      .catch((error) => {
        console.error('Error al crear el producto:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor='name'>
        Nombre del Producto
        <input
          required
          type='text'
          name='name'
          id='name'
          placeholder='Cafe Expresso'
        />
      </label>
      <label htmlFor='price'>
        Precio del Producto
        <input
          required
          type='number'
          name='price'
          id='price'
          placeholder='4000'
        />
      </label>
      <label htmlFor='category'>
        Categoria del producto
        <select name='category' id='category' defaultValue='' required>
          <option value='' disabled>
            seleccione una categoria
          </option>
          {data.map((categoria, index) => (
            <option key={index} value={categoria.name}>
              {categoria.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor='inventory_count'>
        Stock
        <input
          required
          type='number'
          name='inventory_count'
          id='inventory_count'
          placeholder='100'
        />
      </label>
      <label htmlFor='image'>
        Imagen del Producto
        <input
          required
          type='file'
          name='image'
          id='image'
          accept='image/jpeg, image/png, image/webp, image/jpg'
        />
      </label>
      <label htmlFor='description'>
        Descripción del producto
        <textarea
          name='description'
          id='description'
          placeholder='Descripción del producto'
        ></textarea>
      </label>
      <button type='submit'>
        {isLoading ? <Spinner /> : 'Crear producto'}
      </button>
      {error && <small>{error}</small>}
    </form>
  )
}

export default CreateProductsForm
