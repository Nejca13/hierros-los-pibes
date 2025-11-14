'use client'
import Spinner from '@/components/Spinner/Spinner'
import styles from './../Login.module.css'
import Alert from '@/assets/icons/Alert'
import { useState } from 'react'
import { recoveryPassword } from '@/services/login/login'
import { useRouter } from 'next/navigation'

const Recovery = ({ setShowRecovery }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)

  const router = useRouter()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = Object.fromEntries(new FormData(e.target))

    await recoveryPassword(formData.username)
      .then((response) => {
        if (!response.success) {
          setErrorMessage(response.message.detail)
        } else {
          setShowAlert(true)
          e.target.reset()
        }
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='username' id='username'>
        Correo Electrónico
        <input
          type='email'
          name='username'
          id='username'
          placeholder='Correo Electrónico'
          required
          autoComplete='email'
        />
      </label>
      {errorMessage && <small className={styles.error}>{errorMessage}</small>}
      <button type='submit' className={styles.button}>
        {isLoading ? <Spinner /> : 'Enviar'}
      </button>
      {showAlert && (
        <div className={styles.info}>
          <span>
            <Alert color='var(--marron)' />
            Verifica tu correo electrónico
          </span>
          <p>
            Te enviaremos una contraseña temporal para que puedas acceder a tu
            cuenta. Una vez dentro, podrás personalizarla y cambiarla por una de
            tu preferencia.
          </p>
        </div>
      )}
      <button
        className={styles.backLogin}
        onClick={() => setShowRecovery(false)}
      >
        Volver a Iniciar Sesión
      </button>
    </form>
  )
}

export default Recovery
