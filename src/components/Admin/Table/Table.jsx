'use client'
import styles from './Table.module.css'
import SpinnerForm from '@/components/Spinner/SpinnerForm/SpinnerForm'

const Table = ({
  data,
  loading = false,
  error = false,
  onRowClick,
  minHeigth,
}) => {
  if (loading) {
    return (
      <div
        className={styles.spinnerContainer}
        style={{ minHeight: minHeigth ? minHeigth : '' }}
      >
        <SpinnerForm />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={styles.spinnerContainer}
        style={{ minHeight: minHeigth ? minHeigth : '' }}
      >
        <h2>{error}</h2>
      </div>
    )
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div
        className={styles.spinnerContainer}
        style={{ minHeight: minHeigth ? minHeigth : '' }}
      >
        <h2>No hay datos para mostrar</h2>
      </div>
    )
  }

  const columns = Object.keys(data[0]).filter((key) => !key.startsWith('_'))

  return (
    <div
      className={styles.container}
      style={{ maxHeight: 'calc(100vh - 200px)', minHeight: minHeigth }}
    >
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((key) => (
              <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.scrollBody}>
          {data.map((item, i) => (
            <tr key={i} onClick={() => onRowClick?.(item)}>
              {columns.map((key) => (
                <td
                  key={key}
                  className={key === 'Nombre' ? styles.truncate : ''}
                  title={key === 'Nombre' ? item[key]?.props?.name : ''}
                >
                  {item[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
