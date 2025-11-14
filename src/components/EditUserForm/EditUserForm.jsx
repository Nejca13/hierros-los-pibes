'use client'

import { useState } from 'react'
import Image from 'next/image'
import user_avatar from '@/assets/images/user.webp'
import Camera from '@/assets/icons/Camera'
import styles from './EditUserForm.module.css'
import { updateUser } from '@/services/user/updateUser'
import Swal from 'sweetalert2'
import useStore from '@/app/store'

export default function EditUserForm({ defaultValues, onClose }) {
  const [form, setForm] = useState({
    name: defaultValues?.name || '',
    email: defaultValues?.email || '',
    img: defaultValues?.img || null,
  })
  console.log(defaultValues)
  const { setCurrentUser } = useStore()
  const [errors, setErrors] = useState({})
  const [previewImage, setPreviewImage] = useState(defaultValues?.img || null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, img: file })
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name) newErrors.name = 'Campo obligatorio'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Email inválido'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length) {
      setErrors(validation)
      return
    }

    console.log(form)

    await updateUser(defaultValues.id, form).then((response) => {
      console.log('RESPONSE', response)
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'El usuario se actualizo correctamente',
          showConfirmButton: false,
          timer: 1500,
        })
        setCurrentUser(response.data)
        onClose()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message.detail || 'Ocurrio un error inesperado',
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <h2 className={styles.title}>Editar usuario</h2>

      <label htmlFor='img' className={styles.emptyImage}>
        <Image
          className={styles.image}
          src={previewImage || form.image || user_avatar}
          alt='Avatar'
          width={130}
          height={130}
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
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </label>

      <div className={styles.field}>
        <label className={styles.label}>Nombre</label>
        <input
          name='name'
          value={form.name}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Correo electronico</label>
        <input
          name='email'
          value={form.email}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <button type='submit' className={styles.button}>
        Guardar cambios
      </button>
    </form>
  )
}
