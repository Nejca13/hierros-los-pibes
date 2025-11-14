import { useState } from 'react'

export function useMoneyInput(initialValue = 0) {
  const [formattedValue, setFormattedValue] = useState('')
  const [rawValue, setRawValue] = useState(initialValue)

  const moneyFormat = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const handleChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')
    const numeric = parseInt(onlyNumbers || '0', 10) / 100
    setRawValue(numeric)
    setFormattedValue(moneyFormat(numeric))
  }

  const setValue = (value) => {
    setRawValue(value)
    setFormattedValue(moneyFormat(value))
  }

  return {
    formattedValue,
    rawValue,
    handleChange,
    setValue, // <- nuevo setter
  }
}
