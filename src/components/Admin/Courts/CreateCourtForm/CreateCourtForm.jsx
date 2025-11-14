'use client'
import { createCourt } from '@/services/courts/court'
import styles from './CreateCourtForm.module.css'
import { useState } from 'react'
import Spinner from '@/components/Spinner/Spinner'

const CreateCourtForm = ({ obtenerCanchas }) => {
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = Object.fromEntries(new FormData(event.target))

    await createCourt(formData)
      .then((response) => {
        console.log('Cancha creada:', response)
        obtenerCanchas()
        event.target.reset()
      })
      .catch((error) => {
        console.error('Error al crear la cancha:', error)
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
        />
      </label>
      <label htmlFor='image'>
        Imagen de la cancha
        <input
          required
          type='file'
          name='image'
          id='image'
          accept='image/jpeg, image/png, image/webp, image/jpg'
        />
      </label>
      <label htmlFor='sport_type'>
        Tipo de deporte
        <select name='sport_type' id='sport_type' defaultValue='' required>
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
        />
      </label>
      <button type='submit'>{isLoading ? <Spinner /> : 'Crear cancha'}</button>
    </form>
  )
}

export default CreateCourtForm
