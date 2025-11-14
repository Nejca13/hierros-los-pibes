import { useState } from 'react'
import styles from './ChangePasswordForm.module.css'
import { changePassword } from '@/services/user/changePassword'
import Swal from 'sweetalert2'

export default function ChangePasswordForm({ userId }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.currentPassword) newErrors.currentPassword = 'Campo obligatorio'
    if (form.newPassword.length < 6)
      newErrors.newPassword = 'Mínimo 6 caracteres'
    if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = 'No coinciden'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length) {
      setErrors(validation)
      return
    }
    await changePassword(userId, form.newPassword, form.currentPassword).then(
      (response) => {
        console.log('RESPONSE', response)
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'La contraseña se actualizo correctamente',
            showConfirmButton: false,
            timer: 1500,
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message.detail || 'Ocurrio un error inesperado',
          })
        }
      }
    )
  }

  // @asd123QWE

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <h2 className={styles.title}>Cambiar contraseña</h2>

      <div className={styles.field}>
        <label className={styles.label}>Contraseña actual</label>
        <input
          name='currentPassword'
          type='password'
          value={form.currentPassword}
          onChange={handleChange}
          placeholder='Contraseña actual'
          className={styles.input}
        />
        {errors.currentPassword && (
          <span className={styles.error}>{errors.currentPassword}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Nueva contraseña</label>
        <input
          name='newPassword'
          type='password'
          value={form.newPassword}
          onChange={handleChange}
          placeholder='Nueva contraseña'
          className={styles.input}
        />
        {errors.newPassword && (
          <span className={styles.error}>{errors.newPassword}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Confirmar contraseña</label>
        <input
          name='confirmPassword'
          type='password'
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder='Confirmar contraseña'
          className={styles.input}
        />
        {errors.confirmPassword && (
          <span className={styles.error}>{errors.confirmPassword}</span>
        )}
      </div>

      <button type='submit' className={styles.button}>
        Confirmar
      </button>
    </form>
  )
}
