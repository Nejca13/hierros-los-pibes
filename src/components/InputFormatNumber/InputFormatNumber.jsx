'use client'
import { useEffect, useState } from 'react'
import { formatCurrencyARS } from '@/utils/formatCurrency'
import styles from './InputFormatNumber.module.css'

export default function InputFormatNumber({
  title,
  smallText = '',
  id,
  name,
  placeholder = '',
  required = false,
  realAmount = 0,
  setValue,
  controlledValue,
  readOnly = false,
  onValidChange,
}) {
  const format = (value) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(value)

  const [formattedValue, setFormattedValue] = useState(
    controlledValue !== undefined ? format(controlledValue) : ''
  )
  const [rawValue, setRawValue] = useState(
    controlledValue !== undefined ? controlledValue : null
  )
  const [touched, setTouched] = useState(false)

  // Sincronizar cuando controlledValue cambie desde afuera
  useEffect(() => {
    if (controlledValue !== undefined) {
      setRawValue(controlledValue)
      setFormattedValue(format(controlledValue))
    }
  }, [controlledValue])

  const handleChange = (e) => {
    if (readOnly) return // No permitir cambios si es solo lectura

    const onlyNumbers = e.target.value.replace(/\D/g, '')
    const numeric = parseInt(onlyNumbers || '0', 10) / 100

    setRawValue(numeric)
    setValue && setValue(numeric)
    setFormattedValue(format(numeric))

    if (!touched) setTouched(true)

    if (onValidChange) {
      onValidChange({
        isValid: numeric === realAmount,
        value: numeric,
      })
    }
  }

  const difference = rawValue !== null ? rawValue - realAmount : 0
  const matches = rawValue === realAmount

  return (
    <label className={styles.wrapper}>
      {title}
      <input
        type='text'
        id={id}
        name={name}
        placeholder={placeholder}
        inputMode='numeric'
        value={formattedValue}
        onChange={handleChange}
        required={required}
        readOnly={readOnly}
        className={`${styles.input} ${readOnly ? styles.readOnly : ''}`}
      />

      {/* input oculto con el valor real */}
      <input type='hidden' name={name} value={rawValue ?? ''} />

      <small className={`${styles.small} ${readOnly ? styles.readOnly : ''}`}>
        {smallText} {formatCurrencyARS(realAmount)}
      </small>

      {touched && rawValue !== null && !matches && (
        <small
          className={styles.error_text}
          style={{ color: 'red', lineHeight: '5px' }}
        >
          El monto no coincide,{' '}
          {difference < 0
            ? `faltante: ${formatCurrencyARS(Math.abs(difference))}`
            : `hay ${formatCurrencyARS(Math.abs(difference))} de más`}
        </small>
      )}
    </label>
  )
}
