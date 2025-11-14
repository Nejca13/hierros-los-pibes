import styles from './Pagination.module.css'

const Pagination = ({
  page,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1)
  }

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1)
  }

  const handleLimitChange = (e) => {
    onLimitChange(Number(e.target.value))
  }

  const renderPageNumbers = () => {
    const pages = []
    const showLeftEllipsis = page > 3
    const showRightEllipsis = page < totalPages - 2

    const createButton = (i) => (
      <button
        key={i}
        className={`${styles.pageButton} ${i === page ? styles.active : ''}`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    )

    // Primera página
    pages.push(createButton(1))

    // Ellipsis izquierda
    if (showLeftEllipsis) {
      pages.push(
        <span key='left-ellipsis' className={styles.ellipsis}>
          ...
        </span>
      )
    }

    // Páginas del medio
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(createButton(i))
      }
    }

    // Ellipsis derecha
    if (showRightEllipsis) {
      pages.push(
        <span key='right-ellipsis' className={styles.ellipsis}>
          ...
        </span>
      )
    }

    // Última página (si es distinta a la primera)
    if (totalPages > 1) {
      pages.push(createButton(totalPages))
    }

    return pages
  }

  return (
    <div className={styles.pagination_container}>
      <select value={limit} onChange={handleLimitChange}>
        {[...Array(4)].map((_, index) => {
          const value = (index + 1) * 25
          return (
            <option key={value} value={value}>
              {value} por página
            </option>
          )
        })}
      </select>
      <div className={styles.pagination_button}>
        <button
          onClick={handlePrevious}
          disabled={page === 1}
          className={styles.button_back}
        >
          Anterior
        </button>
        {renderPageNumbers()}
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className={styles.button_next}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default Pagination
