'use client'
import HandDrawLine from '@/assets/icons/HandDrawLine'
import styles from './Menu.module.css'
import ToolBar from './ToolBar/ToolBar'
import Products from './Products/Products'
import { useProducts } from '@/Hooks/useProducts'

const Menu = () => {
  const { data, loading, error, updateFilter } = useProducts()

  return (
    <section className={styles.container} id='menu'>
      <div className={styles.title}>
        <h2>Nuestro Menu</h2>
        <HandDrawLine color='var(--black)' />
      </div>
      <ToolBar updateFilter={updateFilter} />
      <Products data={data?.productos} loading={loading} error={error} />
    </section>
  )
}

export default Menu
