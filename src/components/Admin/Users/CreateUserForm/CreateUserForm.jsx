'use client'
import Spinner from '@/components/Spinner/Spinner'
import styles from './CreateUserForm.module.css'
import { useState } from 'react'
import provisory_img from '@/assets/images/user.webp'
import Image from 'next/image'
import Camera from '@/assets/icons/Camera'
import OpenEye from '@/assets/icons/OpenEye'
import CloseEye from '@/assets/icons/CloseEye'
import { register } from '@/services/register/register'
import Swal from 'sweetalert2'
import { updateUser } from '@/services/user/updateUser'

const CreateUserForm = ({ refresh, closeModal, selectedUser }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [currentImage, setCurrentImage] = useState(
    selectedUser?.img ? selectedUser?.img : provisory_img
  )

  const handleTogglePassword = () => {
    setShowPassword((prevState) => !prevState)
  }

  //envia el formulario para crear usuarioc
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = Object.fromEntries(new FormData(e.target))
    if (formData.img.size === 0)
      setError('Por favor, seleccioná una imagen de perfil')
    if (formData.password !== formData['confirm-password']) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    console.log(formData)

    await register(formData, formData.role)
      .then((response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario creado',
            text: 'El usuario se creó correctamente.',
            confirmButtonColor: '#8B5E3C',
          })

          refresh()
          closeModal()
        } else {
          setError(response.message.detail)
        }
      })
      .catch((error) => {
        setError('Error al crear:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  //envia el formulario para actulizar el usuaurio xd
  const onSubmitUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = Object.fromEntries(new FormData(e.target))

    if (formData.img.size === 0) delete formData.img
    if (formData.name === selectedUser?.name) delete formData.name
    if (formData.last_name === selectedUser?.last_name)
      delete formData.last_name
    if (formData.email === selectedUser?.email) delete formData.email
    if (formData.phone_number === selectedUser?.phone_number)
      delete formData.phone_number
    if (formData.is_active === String(selectedUser?.is_active)) {
      delete formData.is_active
    } else {
      formData.is_active = formData.is_active === 'true'
    }
    if (formData.is_verified === String(selectedUser?.is_verified)) {
      delete formData.is_verified
    } else {
      formData.is_verified = formData.is_verified === 'true'
    }
    if (Object.keys(formData).length === 0) {
      setError('Realiza cambios para poder actualizar el producto')
      setLoading(false)
      return
    }

    console.log(formData)

    await updateUser(selectedUser?.id, formData)
      .then((response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario actulizado',
            text: 'El usuario se actualizo correctamente.',
            confirmButtonColor: '#8B5E3C',
          })

          refresh()
          closeModal()
        } else {
          setError(response.message.detail)
        }
      })
      .catch((error) => {
        setError('Error al actualizar:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <form
      className={styles.form}
      onSubmit={selectedUser ? onSubmitUpdate : onSubmit}
    >
      <label htmlFor='img' id='img' name='img' className={styles.emptyImage}>
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
          name='img'
          id='img'
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
          Nombre
          <input
            type='text'
            name='name'
            id='name'
            placeholder='Nombre'
            defaultValue={selectedUser?.name || ''}
            required={selectedUser ? false : true}
          />
        </label>
        <label htmlFor='last_name'>
          Apellido
          <input
            type='text'
            name='last_name'
            id='last_name'
            placeholder='Apellido'
            defaultValue={selectedUser?.last_name || ''}
            required={selectedUser ? false : true}
          />
        </label>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor='email'>
          Correo electrónico
          <input
            // Forzar minusculas en el correo
            onInput={(e) => {
              e.target.value = e.target.value.toLowerCase()
            }}
            type='email'
            name='email'
            id='email'
            placeholder='user@gmail.com'
            defaultValue={selectedUser?.email || ''}
            required={selectedUser ? false : true}
          />
        </label>
        <label htmlFor='phone_number'>
          Telefono
          <input
            type='number'
            name='phone_number'
            id='phone_number'
            placeholder='3543579562'
            defaultValue={selectedUser?.phone_number || ''}
            required={selectedUser ? false : true}
          />
        </label>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor='role'>
          Rol
          <select name='role' id='role' defaultValue={selectedUser?.role}>
            <option value='empleado'>Empleado/a</option>
            <option value='admin'>Cajero/a</option>
          </select>
        </label>
      </div>
      {!selectedUser && (
        <div className={styles.formGroup}>
          <label htmlFor='password' id='password'>
            Contraseña
            <div className={styles.input_container}>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                id='password'
                placeholder='********'
              />
              <button
                type='button'
                className={styles.togglePassword}
                onClick={handleTogglePassword}
              >
                {showPassword ? (
                  <OpenEye width='20px' height='20px' />
                ) : (
                  <CloseEye width='20px' height='20px' />
                )}
              </button>
            </div>
          </label>
          <label htmlFor='confirm-password' id='confirm-password'>
            Confirmar contraseña
            <div className={styles.input_container}>
              <input
                type={showPassword ? 'text' : 'password'}
                name='confirm-password'
                id='confirm-password'
                placeholder='********'
              />
              <button
                type='button'
                className={styles.togglePassword}
                onClick={handleTogglePassword}
              >
                {showPassword ? (
                  <OpenEye width='20px' height='20px' />
                ) : (
                  <CloseEye width='20px' height='20px' />
                )}
              </button>
            </div>
          </label>
        </div>
      )}
      {selectedUser && (
        <div className={styles.formGroup}>
          <label htmlFor='is_active' id='is_active'>
            Usuario activo
            <select
              name='is_active'
              id='is_active'
              defaultValue={selectedUser?.is_active}
            >
              <option value='true'>Si</option>
              <option value='false'>No</option>
            </select>
          </label>
          <label htmlFor='is_verified' id='is_verified'>
            Usuario verificado
            <select
              name='is_verified'
              id='is_verified'
              defaultValue={selectedUser?.is_verified}
            >
              <option value='true'>Si</option>
              <option value='false'>No</option>
            </select>
          </label>
        </div>
      )}
      <button type='submit' className={styles.button_submith}>
        {loading ? (
          <Spinner />
        ) : selectedUser ? (
          'Actualizar usuario'
        ) : (
          'Crear usuario'
        )}
      </button>
      {error && <small className={styles.error}>{error}</small>}
    </form>
  )
}

export default CreateUserForm
