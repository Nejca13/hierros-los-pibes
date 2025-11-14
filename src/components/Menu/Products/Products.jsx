'use client'
import styles from './Products.module.css'
import Image from 'next/image'
import FaCirclePlus from '@/assets/icons/FaCirclePlus'
import FaCircleMinus from '@/assets/icons/FaCircleMinus'
import useStore from '@/app/store'
import useCategorias from '@/Hooks/useCategories'
import { useRef } from 'react'
import ArrowScrollLeft from '@/assets/icons/ArrowScrollLeft'
import ArrowScrollRigth from '@/assets/icons/ArrowScrollRigth'

const Products = ({ data, loading, error }) => {
  const { currentOrden, addProductToOrder, removeProductFromOrder } = useStore()
  const {
    data: categorias,
    loading: loadingCategorias,
    error: errorCategorias,
  } = useCategorias()
  const scrollRefs = useRef({})

  // Comprobamos si hay errores
  if (error || errorCategorias) {
    return (
      <div className={styles.loading}>
        <p>Error al obtener los productos</p>
      </div>
    )
  }

  // Skeleton de carga
  if (loading || loadingCategorias) {
    return (
      <div className={styles.container_products}>
        {categorias?.map((categoria, index) => (
          <div key={index} className={styles.container_categoria}>
            <div className={styles.skeleton_title}></div>
            <div className={styles.scroll_productos}>
              <div className={styles.productos}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.skeleton_card}></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Si no hay productos
  if (!loading && data?.length === 0) {
    return (
      <div className={styles.loading}>
        <p>No hay productos disponibles</p>
      </div>
    )
  }
  // Filtrar productos disponibles
  const dataFiltrada = data?.filter(
    (producto) => producto?.available === true && producto?.inventory_count > 0
  )
  // Agrupar productos por categoría
  const productosPorCategoria = categorias?.reduce((acc, category) => {
    const categoryName = category?.name?.trim() || ''
    const productosDeCategoria = dataFiltrada?.filter(
      (producto) => producto?.category?.trim() === categoryName
    )

    if (productosDeCategoria?.length > 0) {
      acc[categoryName] = productosDeCategoria
    }
    return acc
  }, {})

  const handleScroll = (index, direction) => {
    const container = scrollRefs.current[index]
    if (container) {
      const scrollAmount = direction === 'left' ? -360 : 360 // 300px card + 20px gap
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.container_products}>
      {Object.entries(productosPorCategoria || {}).length === 0 ? (
        <p>No hay productos disponibles</p>
      ) : (
        Object.entries(productosPorCategoria).map(
          ([tituloCategoria, productos], index) => {
            const categoriaId = tituloCategoria
              .toLowerCase()
              .replace(/\s+/g, '-')

            return (
              <div
                key={index}
                id={categoriaId}
                className={styles.container_categoria}
              >
                <div className={styles.title_buttons}>
                  <h3 className={styles.categoria_title}>{tituloCategoria}</h3>
                  <div className={styles.buttons}>
                    <button
                      onClick={() => handleScroll(index, 'left')}
                      disabled={productos.length <= 1}
                      style={{ opacity: productos.length <= 1 ? 0.4 : 1 }}
                    >
                      <ArrowScrollLeft
                        color='black'
                        width='40px'
                        height='40px'
                      />
                    </button>
                    <button
                      onClick={() => handleScroll(index, 'right')}
                      disabled={productos.length <= 1}
                      style={{ opacity: productos.length <= 1 ? 0.4 : 1 }}
                    >
                      <ArrowScrollRigth
                        color='black'
                        width='40px'
                        height='40px'
                      />
                    </button>
                  </div>
                </div>
                <div className={styles.scroll_productos}>
                  <div
                    className={styles.productos}
                    ref={(el) => (scrollRefs.current[index] = el)}
                  >
                    {productos.map((producto, i) => {
                      const existingProduct = currentOrden?.products?.find(
                        (item) => item?.product_id === producto?._id
                      )
                      return (
                        <div key={i} className={styles.producto}>
                          <div className={styles.content_card}>
                            <Image
                              src={producto.image}
                              width={300}
                              height={200}
                              alt={producto.name}
                            />
                            <div className={styles.info_card}>
                              <div className={styles.producto_header}>
                                <h4 className={styles.producto_nombre}>
                                  {producto.name}
                                </h4>
                                <span className={styles.producto_precio}>
                                  ${producto.price}
                                </span>
                              </div>
                              <p className={styles.producto_descripcion}>
                                {producto.description}
                              </p>
                            </div>
                          </div>
                          <div className={styles.buttons_add_products}>
                            {existingProduct ? (
                              <div className={styles.quantity_buttons}>
                                <button
                                  className={styles.button_quantity}
                                  onClick={() =>
                                    removeProductFromOrder(producto)
                                  }
                                >
                                  <FaCircleMinus />
                                </button>
                                <span className={styles.producto_cantidad}>
                                  {existingProduct.quantity}
                                </span>
                                <button
                                  className={styles.button_quantity}
                                  onClick={() => addProductToOrder(producto)}
                                >
                                  <FaCirclePlus />
                                </button>
                              </div>
                            ) : (
                              <button
                                className={styles.button_add}
                                onClick={() => addProductToOrder(producto)}
                              >
                                Ordenar producto
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          }
        )
      )}
    </div>
  )
}

export default Products
