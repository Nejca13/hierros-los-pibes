'use client'
import { useState } from 'react'
import Spinner from '../Spinner/Spinner'
import styles from './CreateOrdenForm.module.css'
import { createOrders } from '@/services/orders/orders'
import useStore from '@/app/store'
import Swal from 'sweetalert2'

const CreateOrdenForm = ({
  currentUser,
  currentOrden,
  setPayment,
  closeModal,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { clearCurrentOrden } = useStore()

  const onSubmit = async (e) => {
    e.preventDefault()

    const formData = Object.fromEntries(new FormData(e.target))
    const selectedPaymentMethod = formData.payment_method

    // SweetAlert de confirmación antes de enviar
    const result = await Swal.fire({
      title: '¿Confirmar orden?',
      text: '¿Estás seguro de confirmar esta orden?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--marron)',
      cancelButtonColor: '#3085d6',
    })

    if (!result.isConfirmed) {
      return // Si cancela, no sigue
    }

    setIsLoading(true)

    localStorage.setItem('guest_email', formData.guest_email)

    if (currentUser?.id) formData.user_id = currentUser?.id
    if (currentUser?.email) formData.guest_email = currentUser?.email
    if (currentOrden) formData.products = currentOrden?.products
    formData.table = 'online'
    formData.paid = false

    console.log(formData)

    await createOrders(formData)
      .then((response) => {
        if (!response.success) {
          console.error('Error al crear la orden:', response.error)
          return
        }

        if (selectedPaymentMethod === 'mercadopago') {
          setPayment({ mercadopago: response?.data?.payment_url })
        }

        if (selectedPaymentMethod === 'caja') {
          setPayment({ caja: true })
          clearCurrentOrden()
        }

        closeModal()
      })
      .catch((error) => {
        console.error('Error al crear la orden:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {!currentUser && (
        <label htmlFor='guest_name'>
          Nombre
          <input
            required
            type='text'
            name='guest_name'
            id='guest_name'
            placeholder='Nombre'
          />
        </label>
      )}
      {!currentUser && (
        <label htmlFor='guest_email'>
          Correo electronico
          <input
            required
            type='text'
            name='guest_email'
            id='guest_email'
            placeholder='Correo electronico'
          />
        </label>
      )}
      <label htmlFor='payment_method'>
        Metodo de pago
        <select
          name='payment_method'
          id='payment_method'
          defaultValue=''
          required
        >
          <option value='' disabled>
            seleccione una metodo de pago
          </option>
          <option value='caja'>Pagar en caja</option>
          <option value='mercadopago'>Pagar con mercado pago</option>
        </select>
      </label>
      <label htmlFor='note'>
        Nota para su pedido
        <textarea
          name='note'
          id='note'
          placeholder='Escriba aquí alguna indicación especial para su pedido...'
        ></textarea>
      </label>
      <button type='submit'>
        {isLoading ? <Spinner /> : 'Confirmar Orden'}
      </button>
    </form>
  )
}

export default CreateOrdenForm
