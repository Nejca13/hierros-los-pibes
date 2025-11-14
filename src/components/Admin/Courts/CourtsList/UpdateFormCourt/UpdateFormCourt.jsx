'use client'
import useStore from '@/app/store'
import styles from './UpdateFormCourt.module.css'
import Spinner from '@/components/Spinner/Spinner'
import { updateCourt } from '@/services/courts/court'
import Image from 'next/image'
import { useState } from 'react'

const UpdateFormCourt = ({ courtToUpdate, closeModal, obtenerCanchas }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const { currentUser } = useStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.target)

    // Quitamos los campos que no cambiaron para no actualizarlos

    if (formData.get('name') === courtToUpdate.name) {
      formData.delete('name')
    }

    if (formData.get('image').size === 0) {
      formData.delete('image')
    }

    if (formData.get('sport_type') === courtToUpdate.type_sport) {
      formData.delete('sport_type')
    }

    if (formData.get('location') === courtToUpdate.location) {
      formData.delete('location')
    }

    if (formData.get('price') === courtToUpdate.price) {
      formData.delete('price')
    }

    console.log(Object.fromEntries(formData))

    await updateCourt(courtToUpdate._id, formData)
      .then((response) => {
        closeModal()
        obtenerCanchas()
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
      <label htmlFor='name'>
        Nombre de la cancha
        <input
          required
          type='text'
          name='name'
          id='name'
          placeholder='Ej: Cancha Futbol 5'
          defaultValue={courtToUpdate?.name}
        />
      </label>
      <label htmlFor='image'>
        Imagen de la cancha
        <div className={styles.image}>
          <input
            type='file'
            name='image'
            id='image'
            accept='image/jpeg, image/png, image/webp, image/jpg'
            onChange={(e) =>
              setCurrentImage(URL.createObjectURL(e.target.files[0]))
            }
          />
          <Image
            src={currentImage ? currentImage : courtToUpdate?.image}
            alt='Imagen de la cancha'
            width={50}
            height={50}
            style={{ borderRadius: '6px' }}
          />
        </div>
      </label>
      <label htmlFor='sport_type'>
        Tipo de deporte
        <select
          name='sport_type'
          id='sport_type'
          defaultValue={courtToUpdate?.sport_type}
          required
        >
          <option value='' disabled>
            seleccione un deporte
          </option>
          <option value='futbol'>Fútbol</option>
          <option value='padel'>Pádel</option>
        </select>
      </label>
      <label htmlFor='location'>
        Ubicación
        <input
          required
          type='text'
          name='location'
          id='location'
          placeholder='Ubicacion de la cancha'
          defaultValue={courtToUpdate?.location}
        />
      </label>
      <label htmlFor='price'>
        Precio
        <input
          required
          type='number'
          name='price'
          id='price'
          placeholder='Precio de la cancha'
          defaultValue={courtToUpdate?.price}
        />
      </label>
      <button type='submit'>
        {isLoading ? <Spinner /> : 'Actualizar cancha'}
      </button>
    </form>
  )
}

export default UpdateFormCourt
