'use client'
import useStore from '@/app/store'
import { useEffect, useState } from 'react' // Import useEffect
import Swal from 'sweetalert2'
import styles from './Alquileres.module.css'

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const Alquileres = () => {
  const { currentUser } = useStore()
  const [courtType, setCourtType] = useState('padel')
  const [courtName, setCourtName] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [price, setPrice] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [openModal, setOpenModal] = useState(false)

  // State for daily summary
  const [summaryDate, setSummaryDate] = useState(getTodayDate())
  const [dailySummary, setDailySummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [errorSummary, setErrorSummary] = useState(null)
  const [courts, setCourts] = useState([])

  // Fetch daily summary
  useEffect(() => {
    const fetchDailySummary = async () => {
      setLoadingSummary(true)
      setErrorSummary(null)
      try {
        const response = await fetch(
          `/api/alquileres/summary/?selected_date=${summaryDate}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        )
        if (!response.ok) {
          throw new Error('Error al obtener el resumen diario')
        }
        const data = await response.json()
        setDailySummary(data)
        console.log(data)
      } catch (error) {
        setErrorSummary(error.message)
      } finally {
        setLoadingSummary(false)
      }
    }

    if (currentUser) {
      fetchDailySummary()
    }
  }, [summaryDate, currentUser])
  const fetchCourts = async () => {
    try {
      const res = await fetch('/api/courts_v2/', {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      })

      if (!res.ok) throw new Error('Error al cargar canchas')

      const data = await res.json()
      setCourts(data)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      })
    }
  }

  useEffect(() => {
    if (currentUser) fetchCourts()
  }, [currentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/alquileres/create-alquiler/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          court_type: courtType,
          court_name: courtName,
          alquiler_date: date,
          alquiler_start_time: startTime,
          alquiler_end_time: endTime,
          price: parseFloat(price),
          payment_method: paymentMethod,
        }),
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Alquiler creado',
          text: 'El alquiler se ha creado correctamente.',
        })
        // Reset form fields
        setCourtType('padel')
        setCourtName('')
        setDate('')
        setStartTime('')
        setEndTime('')
        setPrice('')
        setPaymentMethod('efectivo')
        // Refetch summary after creating a new alquiler
        setSummaryDate(getTodayDate()) // This will trigger useEffect to refetch
      } else {
        throw new Error('Error al crear el alquiler')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      })
    }
  }

  const handleCreateCourt = async () => {
    try {
      const res = await fetch('/api/courts_v2/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`, // si tu backend lo pide
        },
        body: JSON.stringify({
          court_type: courtType,
          court_name: courtName,
        }),
      })

      if (!res.ok) throw new Error('No se pudo crear la cancha')

      Swal.fire({
        icon: 'success',
        title: 'Cancha creada',
        text: 'La cancha se registró correctamente',
      })

      fetchCourts()
      setOpenModal(false)
      setCourtName('')
      setCourtType('padel')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      })
    }
  }

  useEffect(() => {
    setCourtName('')
  }, [courtType])

  return (
    <div className={styles.container}>
      {openModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Nueva cancha</h3>

            <select
              value={courtType}
              onChange={(e) => setCourtType(e.target.value)}
            >
              <option value='padel'>Pádel</option>
              <option value='pickelball'>Pickleball</option>
            </select>

            <input
              placeholder='Nombre de la cancha'
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.modalPrimaryBtn}
                onClick={handleCreateCourt}
              >
                Guardar
              </button>

              <button
                className={styles.modalCancelBtn}
                onClick={() => setOpenModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.mainContent}>
        <div>
          <button
            className={styles.addCourtBtn}
            onClick={() => setOpenModal(true)}
          >
            + Agregar cancha
          </button>

          <h2>Cargar Alquiler</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor='courtName'>Cancha</label>
              <select
                id='courtName'
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
              >
                <option value=''>Seleccionar cancha...</option>

                {courts
                  .filter((c) => c.court_type === courtType)
                  .map((court) => (
                    <option key={court._id} value={court.court_name}>
                      ({court.court_type.toUpperCase()}){' '}
                      {court.court_name || 'Sin nombre'}
                    </option>
                  ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='date'>Fecha</label>
              <input
                type='date'
                id='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='startTime'>Hora de inicio</label>
              <input
                type='time'
                id='startTime'
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='endTime'>Hora de fin</label>
              <input
                type='time'
                id='endTime'
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='price'>Precio</label>
              <input
                type='number'
                id='price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='paymentMethod'>Método de pago</label>
              <select
                id='paymentMethod'
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value='efectivo'>Efectivo</option>
                <option value='transferencia'>Transferencia</option>
              </select>
            </div>
            <button type='submit' className={styles.submitButton}>
              Cargar Alquiler
            </button>
          </form>
        </div>

        <div className={styles.summarySection}>
          <h2>Resumen Diario de Alquileres</h2>
          <div className={styles.formGroup}>
            <label htmlFor='summaryDate'>Seleccionar Fecha</label>
            <input
              type='date'
              id='summaryDate'
              value={summaryDate}
              onChange={(e) => setSummaryDate(e.target.value)}
            />
          </div>

          {loadingSummary && <p>Cargando resumen...</p>}
          {errorSummary && (
            <p className={styles.error}>Error: {errorSummary}</p>
          )}

          {dailySummary && !loadingSummary && (
            <div>
              <p>Fecha: {dailySummary.date}</p>
              <p>Total de Alquileres: {dailySummary.total_alquileres}</p>
              <p>Recaudación Total: ${dailySummary.total_revenue}</p>

              <h3>Detalle de Alquileres</h3>
              {dailySummary.alquileres.length > 0 ? (
                <table className={styles.alquileresTable}>
                  <thead>
                    <tr>
                      <th>Tipo de Cancha</th>
                      <th>Nombre de Cancha</th>
                      <th>Hora Inicio</th>
                      <th>Hora Fin</th>
                      <th>Precio</th>
                      <th>Método de Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySummary.alquileres.map((alquiler) => (
                      <tr key={alquiler._id}>
                        <td>{alquiler.court_type}</td>
                        <td>{alquiler.court_name || 'N/A'}</td>
                        <td>{alquiler.alquiler_start_time}</td>
                        <td>{alquiler.alquiler_end_time}</td>
                        <td>${alquiler.price.toFixed(2)}</td>
                        <td>{alquiler.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No hay alquileres para esta fecha.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Alquileres
