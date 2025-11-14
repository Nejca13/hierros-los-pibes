import { useState } from 'react'
import styles from './Filters.module.css'
import useCategorias from '@/Hooks/useCategories'
import Lupa from '@/assets/icons/Lupa'
import ArrowDropright from '@/assets/icons/ArrowDropright'
import IoIosArrowDown from '@/assets/icons/IoIosArrowDown'
import RemoveFilter from '@/assets/icons/RemoveFilter'

const initialFilterState = {
  query: '',
  sort: 'desc',
  category: '',
  available: '',
  featured: '',
}

const Filters = ({ updateFilter, resetFilters }) => {
  const { data } = useCategorias()
  const [filters, setFilters] = useState(initialFilterState)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    updateFilter(name, value)
  }

  const handleReset = () => {
    setFilters(initialFilterState)
    resetFilters()
  }

  return (
    <div className={styles.filter_container}>
      {/* Sort */}
      <label htmlFor='sort'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select name='sort' value={filters.sort} onChange={handleChange}>
          <option value='desc'>Más recientes</option>
          <option value='asc'>Más antiguos</option>
        </select>
      </label>

      {/* Category */}
      <label htmlFor='category'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='category'
          id='category'
          value={filters.category}
          onChange={handleChange}
        >
          <option value='' disabled>
            Categorias
          </option>
          {data.map((categoria, index) => (
            <option key={index} value={categoria.name}>
              {categoria.name}
            </option>
          ))}
        </select>
      </label>

      {/* Available */}
      <label htmlFor='available'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='available'
          value={filters.available}
          onChange={handleChange}
        >
          <option value='' disabled>
            Disponibilidad
          </option>
          <option value='true'>Solo disponibles</option>
          <option value='false'>Agotados</option>
        </select>
      </label>

      {/* Featured */}
      <label htmlFor='featured'>
        <i>
          <IoIosArrowDown color='black' width='14px' height='14px' />
        </i>
        <select
          name='featured'
          value={filters.featured}
          onChange={handleChange}
        >
          <option value='' disabled>
            Promoción
          </option>
          <option value='true'>En promoción</option>
          <option value='false'>Sin promoción</option>
        </select>
      </label>

      <button type='button' onClick={handleReset}>
        Limpiar filtros
        <RemoveFilter width='14px' height='14px' />
      </button>

      {/* Buscador */}
      <label htmlFor='search'>
        <i className={styles.icon_lupa}>
          <Lupa color='grey' width='16px' height='16px' />
        </i>
        <input
          type='text'
          name='query'
          id='search'
          placeholder='Buscar productos...'
          value={filters.query}
          onChange={handleChange}
        />
      </label>
    </div>
  )
}

export default Filters
