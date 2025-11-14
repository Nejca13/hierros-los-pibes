'use client'
import styles from './../Register.module.css'
import Image from 'next/image'
import user_avatar from '@/assets/images/user.webp'
import Camera from '@/assets/icons/Camera'
import useStore from '@/app/store'
import { useState } from 'react'

const StepOne = ({ setStep }) => {
  const [currentImage, setCurrentImage] = useState(null)
  const { currentForm, setCurrentForm } = useStore()

  const onSubmit = async (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.target))
    const data = { ...currentForm, ...formData }
    setCurrentForm(data)
    setStep(2)
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor='img' className={styles.emptyImage}>
        <Image
          className={styles.image}
          src={currentImage || user_avatar}
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
          name='img'
          id='img'
          accept='image/png, image/jpeg, image/jpg, image/webp'
          onChange={(e) =>
            setCurrentImage(URL.createObjectURL(e.target.files[0]))
          }
          onInvalid={(e) => {
            alert(e.target.validationMessage + ' en el campo imagen')
          }}
          style={{ display: 'none' }}
          required
        />
      </label>
      <label htmlFor='name' id='name'>
        Nombre
        <input
          type='text'
          name='name'
          id='name'
          placeholder='Ingrese su nombre'
          required
        />
      </label>
      <label htmlFor='last_name' id='last_name'>
        Apellido
        <input
          type='text'
          name='last_name'
          id='last_name'
          placeholder='Ingrese su apellido'
          required
        />
      </label>
      <label htmlFor='email' id='email'>
        Correo Electrónico
        <input
          type='email'
          name='email'
          id='email'
          placeholder='Ingrese su correo electrónico'
          required
          autoComplete='email'
        />
      </label>
      <button type='submit' className={styles.button}>
        Siguiente
      </button>
    </form>
  )
}

export default StepOne
