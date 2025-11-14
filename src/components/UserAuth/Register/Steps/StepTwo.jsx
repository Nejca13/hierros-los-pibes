'use client'
import { useState } from 'react'
import styles from './../Register.module.css'
import useStore from '@/app/store'
import Spinner from '@/components/Spinner/Spinner'
import OpenEye from '@/assets/icons/OpenEye'
import CloseEye from '@/assets/icons/CloseEye'
import { register } from '@/services/register/register'

const StepTwo = ({ setStep }) => {
  const [preferredSports, setPreferredSports] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { currentForm, setCurrentForm } = useStore()
  const { clearCurrentForm } = useStore.getState()
  const handleTogglePassword = () => {
    setShowPassword((prevState) => !prevState)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    const formData = Object.fromEntries(new FormData(e.target))
    if (formData.password !== formData['confirm-password']) {
      setErrorMessage('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    delete formData.padel
    delete formData.futbol
    formData.preferred_sports = preferredSports

    let data = { ...currentForm, ...formData }
    setCurrentForm(data)

    await register(data)
      .then((response) => {
        if (response.success) {
          setStep(3)
          clearCurrentForm()
        } else {
          setErrorMessage(response.message.detail)
        }
      })
      .catch((error) => {
        setErrorMessage('Error al iniciar sesión:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor='phone_number' id='phone_number'>
        Teléfono
        <input
          type='number'
          name='phone_number'
          id='phone_number'
          placeholder='Ingrese su número de teléfono'
          required
        />
      </label>
      <label htmlFor='password' id='password'>
        Contraseña
        <div className={styles.input_container}>
          <input
            type={showPassword ? 'text' : 'password'}
            name='password'
            id='password'
            placeholder='Contraseña'
            required
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
        Contraseña
        <div className={styles.input_container}>
          <input
            type={showPassword ? 'text' : 'password'}
            name='confirm-password'
            id='confirm-password'
            placeholder='Confirmar contraseña'
            required
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
      <div className={styles.button_container}>
        <button className={styles.button} type='submit'>
          {isLoading ? <Spinner /> : 'Registrarse'}
        </button>
        <button
          className={styles.button}
          onClick={(e) => {
            e.preventDefault()
            clearCurrentForm()
            setStep(1)
          }}
        >
          Volver
        </button>
        {errorMessage && <small className={styles.error}>{errorMessage}</small>}
      </div>
    </form>
  )
}

export default StepTwo
