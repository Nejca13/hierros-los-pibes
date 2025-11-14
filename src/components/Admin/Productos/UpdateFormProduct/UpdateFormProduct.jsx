'use client'
import styles from './UpdateFormProduct.module.css'
import Spinner from '@/components/Spinner/Spinner'
import Image from 'next/image'
import { useState } from 'react'
import Camera from '@/assets/icons/Camera'
import { updateProduct } from '@/services/products/products'
import Swal from 'sweetalert2'
import useCategorias from '@/Hooks/useCategories'

const UpdateFormProduct = ({ product, closeModal, refresh }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentImage, setCurrentImage] = useState(product?.image)
  const [selectedCategory, setSelectedCategory] = useState(product?.category)
  const { data } = useCategorias()

  console.log(product)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = Object.fromEntries(new FormData(e.target))
    if (formData.image.size === 0) {
      delete formData.image
    }

    if (formData.name === product.name) {
      delete formData.name
    }

    if (Number(formData.price) === product.price) {
      delete formData.price
    } else {
      formData.price = Number(formData.price)
    }

    if (formData.category === String(product.category)) {
      delete formData.category
    }

    if (formData.inventory_count === String(product.inventory_count)) {
      delete formData.inventory_count
    }

    if (formData.featured === String(product.featured)) {
      delete formData.featured
    } else {
      formData.featured = formData.featured === 'true'
    }

    if (formData.available === String(product.available)) {
      delete formData.available
    } else {
      formData.available = formData.available === 'true'
    }

    if (formData.description === product.description) {
      delete formData.description
    }

    if (Object.keys(formData).length === 0) {
      setError('Realiza cambios para poder actualizar el producto')
      setIsLoading(false)
      return
    }

    await updateProduct(product._id, formData)
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: 'Producto actualizado',
          text: 'El producto se actualizó correctamente.',
          confirmButtonColor: '#8B5E3C',
        }).then(() => {
          closeModal()
          refresh()
        })
      })
      .catch((error) => {
        console.log(error)
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label
        htmlFor='image'
        id='image'
        name='image'
        className={styles.emptyImage}
      >
        <Image
          className={styles.image}
          src={currentImage}
          alt='Avatar'
          width={130}
          height={130}
          quality={75}
        />
        <div className={styles.icon_camera}>
          <i>
            <Camera color='black' width='20px' height='20px' />
          </i>
        </div>
        <input
          type='file'
          name='image'
          id='image'
          accept='image/png, image/jpeg, image/jpg, image/webp'
          onChange={(e) =>
            setCurrentImage(URL.createObjectURL(e.target.files[0]))
          }
          style={{
            opacity: 0,
            position: 'absolute',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
        />
      </label>
      <div className={styles.formGroup}>
        <label htmlFor='name'>
          Nombre del Producto
          <input
            type='text'
            name='name'
            id='name'
            placeholder='Cafe Expresso'
            defaultValue={product?.name}
          />
        </label>
        <label htmlFor='price'>
          Precio del Producto
          <input
            type='number'
            name='price'
            id='price'
            placeholder='4000'
            defaultValue={product?.price}
          />
        </label>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor='category'>
          Categoria del producto
          <select
            name='category'
            id='category'
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {data?.map((categoria) => (
              <option key={categoria?._id} value={categoria?.name}>
                {categoria?.name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor='inventory_count'>
          Stock
          <input
            type='number'
            name='inventory_count'
            id='inventory_count'
            placeholder='100'
            defaultValue={product?.inventory_count}
          />
        </label>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor='featured'>
          En promoción
          <select
            name='featured'
            id='featured'
            defaultValue={product?.featured}
          >
            <option value='' disabled>
              seleccione el tipo de promoción
            </option>
            <option value='true'>Si</option>
            <option value='false'>No</option>
          </select>
        </label>
        <label htmlFor='available'>
          Disponible
          <select
            name='available'
            id='available'
            defaultValue={product?.available}
          >
            <option value='' disabled>
              seleccione la disponibilidad
            </option>
            <option value='true'>Si</option>
            <option value='false'>No</option>
          </select>
        </label>
      </div>
      <label htmlFor='description'>
        <textarea
          name='description'
          id='description'
          placeholder='Descripción del producto'
          defaultValue={product?.description}
        ></textarea>
      </label>
      <button type='submit'>
        {isLoading ? <Spinner /> : 'Actualizar producto'}
      </button>
      {error && <small className={styles.error}>{error}</small>}
    </form>
  )
}

export default UpdateFormProduct
