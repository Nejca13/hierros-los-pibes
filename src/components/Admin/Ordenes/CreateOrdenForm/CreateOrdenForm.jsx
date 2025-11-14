'use client'
import useDebounce from '@/Hooks/useDebounce'
import { useMoneyInput } from '@/Hooks/useMoneyInput'
import { useProducts } from '@/Hooks/useProducts'
import ChefIcon from '@/assets/icons/ChefIcon'
import LuMenuSquare from '@/assets/icons/LuMenuSquare'
import Lupa from '@/assets/icons/Lupa'
import Screen from '@/assets/icons/Screen'
import Spinner from '@/components/Spinner/Spinner'
import { createOrders, updateOrder } from '@/services/orders/orders'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from './CreateOrdenForm.module.css'
import SelectedProducts from './SelectedProducts/SelectedProducts'

const CreateOrdenForm = ({
  onClose,
  refresh,
  selectedOrder,
  setOrderToPrint,
}) => {
  const { data, loading, filters, updateFilter, resetFilters } = useProducts()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showProducts, setShowProducts] = useState(false)
  const debouncedQuery = useDebounce(filters.query, 500)
  const [internalOrder, setInternalOrder] = useState(false)
  const [useMixedPayment, setUseMixedPayment] = useState(
    selectedOrder?.payment_method === 'mixto' ? true : false
  )
  const [users, setUsers] = useState([])
  const [selectedProducts, setSelectedProducts] = useState(
    selectedOrder?.products_details || []
  )

  const [selectedUser, setSelectedUser] = useState({})

  // Estados para el pago mixto
  const {
    formattedValue: formattedEfectivo,
    rawValue: efectivo,
    handleChange: handleEfectivo,
    setValue: setEfectivoValue,
  } = useMoneyInput()

  const {
    formattedValue: formattedTransferencia,
    rawValue: transferencia,
    handleChange: handleTransferencia,
    setValue: setTransferenciaValue,
  } = useMoneyInput()

  const getUser = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    try {
      const response = await fetch('/api/users/', options)

      if (!response.ok) {
        const error = await response.json()
        console.error('Error al obtener usuarios:', error)
        throw new Error('Error al obtener usuarios')
      }

      const data = await response.json()
      console.log('Usuarios:', data)
      setUsers(data)
      return data
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return null
    }
  }

  const subtotal = selectedProducts.reduce(
    (acc, p) => acc + p.unit_price * p.quantity,
    0
  )
  const total = subtotal

  const handleSelectProduct = (product) => {
    setSelectedProducts((prevProducts) => {
      const existing = prevProducts.find((p) => p.product_id === product._id)
      if (existing) {
        return prevProducts.map((p) =>
          p.product_id === product._id ? { ...p, quantity: p.quantity + 1 } : p
        )
      } else {
        return [
          ...prevProducts,
          {
            product_id: product._id,
            name: product.name,
            unit_price: product.price,
            image: product.image,
            quantity: 1,
          },
        ]
      }
    })
  }

  const sentToKitchen = async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    try {
      const response = await fetch(
        `/api/orders/send-to-kitchen/${selectedOrder._id}/`,
        options
      )
      if (!response.ok) {
        const error = await response.json()
        console.error('Error al enviar a cocina:', error)
        throw new Error('Error al enviar a cocina')
      }
      const data = await response.json()
      console.log('Orden enviada a cocina:', data)
    } catch (error) {
      console.error('Error al enviar a cocina:', error)
    }
  }
  const displayedToClient = async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    try {
      const response = await fetch(
        `/api/orders/finish-and-display/${selectedOrder._id}/`,
        options
      )
      if (!response.ok) {
        const error = await response.json()
        console.error('Error al enviar a pantalla:', error)
        throw new Error('Error al enviar a pantalla')
      }
      const data = await response.json()
      console.log('Orden enviada a pantalla:', data)
    } catch (error) {
      console.error('Error al enviar a pantalla:', error)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // 1. Extraer valores del form y datos necesarios
    const formData = Object.fromEntries(new FormData(e.target))
    formData.guest_email = 'soporte@sportiumcafe.com' // valor por defecto

    // 2. Determinar qué botón disparó el submit (enviar a cocina o a cliente)
    const submitter = e.nativeEvent.submitter
    const action = submitter?.id

    if (action === 'sent_to_kitchen') {
      formData.sent_to_kitchen = true
      if (selectedOrder) {
        await sentToKitchen()
        refresh()
        onClose()
        return
      }
    }
    if (action === 'displayed_to_client') {
      formData.displayed_to_client = true
      if (selectedOrder) {
        await displayedToClient()
        refresh()
        onClose()
        return
      }
    }

    // 3. Limpiar campos inalterados cuando es edición
    if (selectedOrder) {
      if (selectedOrder?.guest_name === formData.guest_name)
        delete formData.guest_name
      if (selectedOrder?.note === formData.note) delete formData.note
    }

    // 4. Ajustar campos fijos según si es create o update
    if (selectedOrder) {
      delete formData.table
      delete formData.paid
      delete formData.payment_origin
    } else {
      formData.table = 'online'
      formData.paid = true
      formData.payment_origin = 'caja'
    }

    // 5. Armar lista de productos con ID y cantidad
    const products = selectedProducts.map((p) => ({
      product_id: p.product_id,
      quantity: p.quantity,
    }))
    formData.products = products

    // 6. Validar que haya al menos un producto
    if (selectedProducts.length === 0) {
      setError('Agrega al menos un producto para crear la orden.')
      setIsLoading(false)
      return
    }

    // 7. Calcular subtotal/total de productos
    const subtotal = selectedProducts.reduce(
      (acc, p) => acc + p.unit_price * p.quantity,
      0
    )
    const total = subtotal // aquí podrías restar descuentos si aplica más adelante

    // 8. Si no es pago mixto, validar que se haya seleccionado un método de pago
    if (!useMixedPayment && !formData.payment_method) {
      setError('Selecciona un método de pago.')
      setIsLoading(false)
      return
    }

    // 9. Si es pago mixto, validar montos
    if (useMixedPayment) {
      if (efectivo + transferencia !== total) {
        setError(
          `La suma de efectivo y transferencia debe ser ${total.toFixed(2)}`
        )
        setIsLoading(false)
        return
      }
      // Sobrescribimos formData para enviar payment_breakdown en lugar de payment_method
      formData.payment_breakdown = [
        { method: 'efectivo', amount: efectivo },
        { method: 'transferencia', amount: transferencia },
      ]

      formData.payment_method = 'mixto'
    }

    // 10. Manejar orden interna
    if (internalOrder) {
      formData.is_internal_order = true
      formData.payment_method = 'interno'
      formData.user_id = selectedUser.id
      formData.guest_name = selectedUser.name + ' ' + selectedUser.last_name
    }

    // 11. Validar para UPDATE que existan cambios (productos o campos)
    if (selectedOrder) {
      const originalProducts = selectedOrder.products_details.map((p) => ({
        product_id: p.product_id,
        quantity: p.quantity,
      }))
      const areProductsEqual = (a, b) => {
        if (a.length !== b.length) return false
        const sa = [...a].sort((x, y) =>
          x.product_id.localeCompare(y.product_id)
        )
        const sb = [...b].sort((x, y) =>
          x.product_id.localeCompare(y.product_id)
        )
        return sa.every((item, idx) => {
          return (
            item.product_id === sb[idx].product_id &&
            item.quantity === sb[idx].quantity
          )
        })
      }
      const noProductChange = areProductsEqual(products, originalProducts)
      const noFieldChange =
        !formData.guest_name && !formData.guest_email && !formData.note

      if (noProductChange && noFieldChange) {
        setError('Realiza cambios para poder actualizar el pedido.')
        setIsLoading(false)
        return
      }
    }

    console.log('Datos del formulario:', formData)

    // 12. Enviar request a backend
    try {
      const response = selectedOrder
        ? await updateOrder(selectedOrder._id, formData)
        : await createOrders(formData)

      if (!response.success) {
        console.error('Error al crear/actualizar la orden:', response.error)
        setError(response.error.detail)
        return
      }

      setOrderToPrint(response?.data?.order)
      refresh()
      onClose()
      console.log('Orden creada/actualizada correctamente:', response)
    } catch (err) {
      console.error('Error en onSubmit:', err)
      setError('Ocurrió un error inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    setSelectedProducts(selectedOrder?.products_details || [])
  }, [selectedOrder])

  useEffect(() => {
    if (debouncedQuery === '') {
      resetFilters()
    } else {
      setShowProducts(true)
    }
  }, [debouncedQuery])

  //useEffect para el update del pago mixto
  useEffect(() => {
    if (selectedOrder?.payment_breakdown) {
      const efectivoAmount =
        selectedOrder?.payment_breakdown.find((p) => p.method === 'efectivo')
          ?.amount || 0
      const transferenciaAmount =
        selectedOrder?.payment_breakdown.find(
          (p) => p.method === 'transferencia'
        )?.amount || 0
      setEfectivoValue(efectivoAmount)
      setTransferenciaValue(transferenciaAmount)
    }
  }, [selectedOrder])

  return (
    <div className={styles.container_form_and_products_selected}>
      <form className={styles.form} onSubmit={onSubmit}>
        {/* Marcar como orden interna */}

        {!internalOrder ? (
          <label htmlFor='guest_name'>
            Nombre del cliente
            <input
              required={selectedOrder?.guest_name ? false : true}
              type='text'
              name='guest_name'
              id='guest_name'
              placeholder='Nombre del cliente'
              defaultValue={selectedOrder?.guest_name}
            />
          </label>
        ) : (
          <label htmlFor='guest_name'>
            Nombre del empleado
            <select
              required
              name='guest_name'
              id='guest_name'
              onChange={(e) => {
                setSelectedUser(
                  users.filter((user) => user.id === e.target.value)[0]
                )
                console.log(
                  users.filter((user) => user.id === e.target.value)[0]
                )
              }}
            >
              <option value=''>Seleccionar usuario</option>
              {users
                .filter((user) =>
                  ['superadmin', 'admin', 'empleado'].includes(user.role)
                )
                .map((user) => (
                  <option key={user.id} id={user.id} value={user.id}>
                    {user.name} {user.last_name} - {user.role}
                  </option>
                ))}
            </select>
          </label>
        )}

        <label htmlFor='products' className={styles.label_list_products}>
          Seleccione productos
          <div className={styles.input_container}>
            <i className={styles.icon}>
              <Lupa color='grey' width='18px' height='18px' />
            </i>
            <input
              type='search'
              placeholder='Seleccione productos'
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
            />
            <button
              onClick={() => setShowProducts(!showProducts)}
              type='button'
              className={styles.button_input}
            >
              <LuMenuSquare color='var(--marron)' width='20px' height='20px' />
            </button>
          </div>
          {showProducts && (
            <div className={styles.products_list_container}>
              {loading ? (
                <div className={styles.loading}>
                  <Spinner />
                </div>
              ) : data?.productos?.filter(
                  (product) => product.available !== false
                ).length === 0 ? (
                <p className={styles.no_results}>Sin resultados</p>
              ) : (
                data?.productos
                  ?.filter((product) => product.available !== false)
                  .map((product, index) => (
                    <div
                      key={index}
                      className={styles.product_item}
                      style={{
                        cursor:
                          product?.inventory_count === 0
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                      onClick={() => {
                        if (product?.inventory_count === 0) return
                        handleSelectProduct(product)
                        setShowProducts(false)
                      }}
                    >
                      <Image
                        src={product?.image}
                        width={30}
                        height={30}
                        alt={product?.name}
                      />
                      {product?.name} - ${product?.price}
                      {product?.inventory_count === 0 ? (
                        <small style={{ color: 'red' }}>Sin stock</small>
                      ) : null}
                    </div>
                  ))
              )}
            </div>
          )}
        </label>
        <label htmlFor='note'>
          <textarea
            name='note'
            id='note'
            placeholder='Escriba aquí alguna indicación especial para el pedido...'
            defaultValue={selectedOrder?.note}
          ></textarea>
        </label>

        <fieldset className={styles.label_paid}>
          <legend>¿Método de pago del pedido?</legend>

          <label>
            <input
              type='radio'
              name='payment_method'
              value='transferencia'
              onChange={() => {
                setUseMixedPayment(false)
                setInternalOrder(false)
              }}
              defaultChecked={selectedOrder?.payment_method === 'transferencia'}
            />
            Transferencia
          </label>

          <label>
            <input
              type='radio'
              name='payment_method'
              value='efectivo'
              onChange={() => {
                setUseMixedPayment(false)
                setInternalOrder(false)
              }}
              defaultChecked={selectedOrder?.payment_method === 'Efectivo'}
            />
            Efectivo
          </label>

          <label>
            <input
              type='radio'
              name='payment_method'
              value='use_mixed'
              onChange={(e) => {
                setUseMixedPayment(e.target.checked)
                setInternalOrder(false)
              }}
              defaultChecked={selectedOrder?.payment_method === 'mixto'}
            />
            Pago mixto
          </label>

          {!selectedOrder && (
            <label
              className={styles.label_internal_order}
              htmlFor='payment_method'
            >
              <input
                type='radio'
                name='payment_method'
                value='interno'
                onChange={() => {
                  setInternalOrder(!internalOrder)
                  setUseMixedPayment(false)
                }}
              />
              Interno
            </label>
          )}
        </fieldset>

        {useMixedPayment && (
          <div className={styles.mixedContainer}>
            <label>
              Monto en Efectivo:
              <input
                type='text'
                value={formattedEfectivo}
                onChange={handleEfectivo}
                placeholder='0.00'
              />
            </label>
            <label>
              Monto en Transferencia:
              <input
                type='text'
                value={formattedTransferencia}
                onChange={handleTransferencia}
                placeholder='0.00'
              />
            </label>
            <div>
              <p>Total productos: ${total.toFixed(2)}</p>
              {efectivo + transferencia !== total && (
                <small style={{ color: 'red' }}>
                  La suma debe ser igual a ${total.toFixed(2)}
                </small>
              )}
            </div>
          </div>
        )}

        {selectedOrder && selectedOrder?.status !== 'paid' && (
          <label htmlFor='status' className={styles.label_mark_paid}>
            ¿Marcar pedido como pagado?
            <input type='checkbox' name='status' id='status' />
          </label>
        )}

        {/* boton para enviar pedido a cocina  */}
        <button className={styles.button_submith} type='submit'>
          {selectedOrder ? 'Actulizar pedido' : 'Crear orden'}
        </button>

        {/* boton para enviar pedido a cocina  */}
        {!selectedOrder?.sent_to_kitchen &&
        !selectedOrder?.displayed_to_client &&
        !internalOrder ? (
          <button
            className={styles.button_submith}
            type='submit'
            id='sent_to_kitchen'
          >
            {selectedOrder
              ? 'Enviar orden a cocina'
              : 'Crear orden y enviar a cocina'}
            <ChefIcon width='18px' height='18px' />
          </button>
        ) : null}

        {/* boton para enviar pedido para retirar */}
        {selectedOrder?.displayed_to_client !== true && !internalOrder ? (
          <button
            className={styles.button_submith}
            type='submit'
            id='displayed_to_client'
          >
            {selectedOrder
              ? 'Enviar orden para retirar'
              : 'Crear orden y enviar para retirar'}
            <Screen width='18px' height='18px' />
          </button>
        ) : null}

        {error && <small>{error}</small>}
      </form>
      {selectedProducts.length > 0 && (
        <SelectedProducts
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
      )}
    </div>
  )
}

export default CreateOrdenForm
