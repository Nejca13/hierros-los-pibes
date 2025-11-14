'use client'
import { useEffect, useState } from 'react'
import styles from './InputFormatTotal.module.css'
import CheckColor from '@/assets/icons/CheckColor'
import { formatCurrencyARS } from '@/utils/formatCurrency'

export default function InputFormatTotal({
  title,
  id,
  name,
  realAmount,
  actualAmount,
  className = '',
}) {
  const [status, setStatus] = useState('')
  const [difference, setDifference] = useState(0)

  useEffect(() => {
    const diff = actualAmount - realAmount
    setDifference(Math.abs(diff))

    if (diff === 0) setStatus('match')
    else if (diff < 0) setStatus('less')
    else setStatus('more')
  }, [actualAmount, realAmount])

  const renderMessage = () => {
    switch (status) {
      case 'match':
        return 'Los montos coinciden correctamente'
      case 'less':
        return `Faltan ${formatCurrencyARS(difference)}`
      case 'more':
        return `Hay ${formatCurrencyARS(difference)} de más`
      default:
        return ''
    }
  }

  return (
    <label className={`${styles.wrapper} ${className}`}>
      {title}
      <div className={styles.inputWrapper}>
        <input
          type='text'
          id={id}
          name={`${name}_formatted`}
          value={formatCurrencyARS(actualAmount)}
          readOnly
          className={`${styles.input} ${styles[status]}`}
        />
        <span className={`${styles.icon} ${styles[status]}`}>
          {status === 'match' ? (
            <CheckColor />
          ) : status === 'less' || status === 'more' ? (
            <svg viewBox='0 0 24 24' width='23.4px' height='23.4px' fill='red'>
              <path
                d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41
                8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59
                15.59 7 17 8.41 13.41 12 17 15.59z'
              />
            </svg>
          ) : null}
        </span>
      </div>

      {/* input oculto con el valor real */}
      <input type='hidden' name={name} value={actualAmount ?? ''} />
      <small>
        Monto de cierre de caja esperado: {formatCurrencyARS(realAmount)}
      </small>

      <small className={`${styles.message} ${styles[status]}`}>
        {renderMessage()}
      </small>
    </label>
  )
}
