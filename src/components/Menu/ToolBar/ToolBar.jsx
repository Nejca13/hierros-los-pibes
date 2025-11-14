'use client'
import styles from './ToolBar.module.css'
import Lupa from '@/assets/icons/Lupa'
import ArrowLeft from '@/assets/icons/ArrowLeft'
import { useState, useRef, useEffect } from 'react'
import { useToggleMenuAnimation } from '@/gsap/Gsap'
import useDebounce from '@/Hooks/useDebounce'
import useCategorias from '@/Hooks/useCategories'

const ToolBar = ({ updateFilter }) => {
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 500)
  const { data, loading, error } = useCategorias()

  const [showMenu, setShowMenu] = useState(false)
  const toolBar = useRef(null)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useToggleMenuAnimation(menuRef.current, showMenu)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    updateFilter('query', debouncedValue)
  }, [debouncedValue, updateFilter])

  const scrollToCategory = (item) => {
    const id = item?.name?.toLowerCase().trim().replace(/\s+/g, '-')
    console.log(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setShowMenu(false)
    }
  }

  return (
    <div className={styles.toolBar} ref={toolBar}>
      <label htmlFor='search'>
        <i className={styles.icon}>
          <Lupa width='15px' height='15px' color='var(--black)' />
        </i>
        <input
          type='search'
          name='search'
          id='search'
          placeholder='Buscar producto'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </label>

      <div className={styles.select}>
        <button
          ref={buttonRef}
          className={styles.button_select_categoria}
          onClick={() => setShowMenu(!showMenu)}
        >
          Categoria
          <ArrowLeft
            rotated={showMenu}
            width='15px'
            height='15px'
            color='white'
          />
        </button>

        <div ref={menuRef} className={styles.categorias}>
          {loading && <p className={styles.empty}>Cargando categorías...</p>}
          {error && (
            <p className={styles.empty}>Error al cargar las categorías</p>
          )}
          {data &&
            data?.length > 0 &&
            data?.map((item, idx) => (
              <button
                key={idx}
                className={styles.categoria_button}
                onClick={() => scrollToCategory(item)}
              >
                {item?.icon} {item?.name}
              </button>
            ))}
          {data && data.length === 0 && !loading && !error && (
            <p className={styles.empty}>No hay categorías disponibles</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ToolBar
