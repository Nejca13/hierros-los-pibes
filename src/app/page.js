'use client'
import Menu from '@/components/Menu/Menu'
import Inicio from '../components/Inicio/Inicio'
import styles from './page.module.css'
import Contacto from '../components/Contacto/Contacto'
import useRequestAudioPermission from '@/Hooks/useRequestAudioPermission'

export default function Home() {
  useRequestAudioPermission()
  return (
    <main className={styles.page}>
      <Inicio />
      <Menu />
      <Contacto />
    </main>
  )
}
