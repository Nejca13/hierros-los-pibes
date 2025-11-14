'use client'
import { useEffect, useState } from 'react'

const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const useDateTime = () => {
  const [fecha, setFecha] = useState(null)

  useEffect(() => {
    const update = () => setFecha(new Date())
    update() // al montarse en cliente
    const interval = setInterval(update, 60000) // cada minuto
    return () => clearInterval(interval)
  }, [])

  if (!fecha) {
    return { fechaFormateada: '', horaFormateada: '' }
  }

  // Formato de fecha en zona Argentina
  const opcionesFecha = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }
  const fechaFormateada = capitalizar(
    fecha.toLocaleDateString('es-AR', opcionesFecha)
  )

  // Formato de hora en zona Argentina
  const opcionesHora = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }
  const horaFormateada = fecha.toLocaleTimeString('es-AR', opcionesHora)

  return { fechaFormateada, horaFormateada }
}

export default useDateTime
