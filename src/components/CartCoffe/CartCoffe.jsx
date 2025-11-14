'use client'
import Link from 'next/link'
import styles from './CartCoffe.module.css'
import CartShoppingCoffe from '@/assets/icons/CartShoppingCoffe'
import useStore from '@/app/store'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { usePathname } from 'next/navigation'

const CartCoffe = () => {
  const { currentOrden } = useStore()
  const cartRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasProducts = currentOrden?.products?.length > 0

    if (hasProducts && !isVisible) {
      gsap.fromTo(
        cartRef.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5 }
      )
      setIsVisible(true)
    } else if (!hasProducts && isVisible) {
      gsap.to(cartRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        onComplete: () => setIsVisible(false),
      })
    }
  }, [currentOrden?.products?.length, isVisible])

  return (
    <div
      className={styles.cart_container}
      ref={cartRef}
      style={{ opacity: 0, scale: 0 }}
    >
      {currentOrden.quantityTotal > 0 && (
        <div className={styles.count_link}>
          <span>{currentOrden.quantityTotal}</span>
        </div>
      )}
      <Link href={'/orden'} aria-label='carrito_de_compra'>
        <CartShoppingCoffe />
      </Link>
    </div>
  )
}

export default CartCoffe
