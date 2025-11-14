'use client'
import HoneyComb from '@/components/Loaders/HoneyComb/HoneyComb'
import styles from './page.module.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useStore from '../store'

const PagoExitosoPage = () => {
  const [contdown, setContdown] = useState(5)
  const router = useRouter()
  const { clearCurrentOrden } = useStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      setContdown(contdown - 1)
    }, 1000)
    if (contdown === 0) {
      clearCurrentOrden()
      router.push('/pedidos')
    }
    return () => clearTimeout(timer)
  }, [contdown])
  return (
    <div className={styles.container}>
      <h1>Pago Exitoso</h1>
      <HoneyComb />
      <p>Gracias por tu compra</p>
      <span>
        Redirigiendo a la pagina principal <strong>{contdown}s</strong>
      </span>
    </div>
  )
}

export default PagoExitosoPage
