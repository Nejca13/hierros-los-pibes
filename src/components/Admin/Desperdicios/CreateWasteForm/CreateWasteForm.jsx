'use client'
import Spinner from '@/components/Spinner/Spinner'
import styles from './CreateWasteForm.module.css'
import { useState } from 'react'
import LuMenuSquare from '@/assets/icons/LuMenuSquare'
import { useProducts } from '@/Hooks/useProducts'
import Lupa from '@/assets/icons/Lupa'
import Image from 'next/image'
import Close from '@/assets/icons/Close'
import Swal from 'sweetalert2'

const CreateWasteForm = ({ onClose, refresh }) => {
  const { data, loading, filters, updateFilter, resetFilters } = useProducts()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showProducts, setShowProducts] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = Object.fromEntries(new FormData(e.target))

    // Validar producto seleccionado
    if (!selectedProduct?._id) {
      setError('Debe seleccionar un producto.')
      setIsLoading(false)
      return
    }

    formData.product_id = selectedProduct._id

    try {
      const response = await fetch('/api/products-waste/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData?.detail || 'Error al registrar el desperdicio'
        )
      }

      const data = await response.json()
      console.log(data)

      Swal.fire({
        icon: 'success',
        title: 'Desperdicio registrado',
        html: `<p>El desperdicio fue agregado correctamente.</p>`,
        confirmButtonColor: '#8B5E3C',
        confirmButtonText: 'OK',
      })
      refresh()
      onClose()
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor='products' className={styles.label_list_products}>
        Seleccione producto
        <div className={styles.input_container}>
          <i className={styles.icon}>
            <Lupa color='grey' width='18px' height='18px' />
          </i>
          <input
            type='search'
            placeholder='Seleccione productos'
            value={selectedProduct ? '' : filters.query}
            onChange={(e) => {
              const value = e.target.value
              updateFilter('query', value)
              setShowProducts(!!value.trim())
              setSelectedProduct(null)
            }}
          />
          <button
            onClick={() => setShowProducts(!showProducts)}
            type='button'
            className={styles.button_input}
          >
            <LuMenuSquare color='var(--marron)' width='20px' height='20px' />
          </button>

          {selectedProduct && (
            <div className={styles.selected_product}>
              <Image
                src={selectedProduct.image}
                width={24}
                height={24}
                alt={selectedProduct.name}
              />
              <span>{selectedProduct.name}</span>
              <button
                type='button'
                onClick={() => setSelectedProduct(null)}
                className={styles.remove_product}
              >
                <Close color='white' width='16px' height='16px' />
              </button>
            </div>
          )}
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
                      setSelectedProduct(product)
                      setShowProducts(false)
                      updateFilter('query', '')
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

      <label htmlFor='quantity'>
        Cantidad de productos desperdiciados
        <input
          required
          type='number'
          name='quantity'
          id='quantity'
          placeholder='0'
        />
      </label>

      <label htmlFor='reason'>
        Razón del desperdicio
        <textarea
          name='reason'
          id='reason'
          placeholder='Ingrese la razón del desperdicio'
        />
      </label>

      <button type='submit' className={styles.create_button}>
        {isLoading ? <Spinner /> : 'Crear desperdicio'}
      </button>

      {error && <small>{error}</small>}
    </form>
  )
}

export default CreateWasteForm
