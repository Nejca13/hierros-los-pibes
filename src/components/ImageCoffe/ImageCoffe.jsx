'use client'
import Image from 'next/image'
import taza_cafe_con_leche from '@/assets/images/taza_cafe_con_leche.webp'
import taza_cafe_negro from '@/assets/images/taza_cafe_negro.webp'
import hot_dog from '@/assets/images/hot_dog.webp'
import styles from './ImageCoffe.module.css'
import { useEffect, useRef } from 'react'
import { inicioAnimate } from '@/gsap/Gsap'
import { usePathname } from 'next/navigation'

const ImageCoffe = () => {
  const taza_cafe_con_leche_ref = useRef(null)
  const taza_cafe_negro_ref = useRef(null)
  const hot_dog_ref = useRef(null)

  const pathname = usePathname()

  useEffect(() => {
    inicioAnimate({
      taza_cafe_con_leche_ref: taza_cafe_con_leche_ref.current,
      taza_cafe_negro_ref: taza_cafe_negro_ref.current,
      hot_dog_ref: hot_dog_ref.current,
    })
  }, [pathname])

  return (
    <div className={styles.imagen_container}>
      <Image
        src={taza_cafe_con_leche}
        width={300}
        height={300}
        alt='taza_cafe_con_leche'
        ref={taza_cafe_con_leche_ref}
        priority
      />
      <Image
        src={taza_cafe_negro}
        width={300}
        height={300}
        alt='taza_cafe_negro'
        ref={taza_cafe_negro_ref}
        priority
      />
      {pathname === '/' && (
        <Image
          src={hot_dog}
          width={300}
          height={300}
          alt='croissant'
          ref={hot_dog_ref}
          priority
        />
      )}
    </div>
  )
}

export default ImageCoffe
