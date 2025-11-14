import styles from './../FormReservas/FormReservas.module.css'

const FormReservas = () => {
  return (
    <form className={styles.form}>
      <label htmlFor='deporte' id='deporte'>
        Tipo de Deporte
        <select name='deporte' id='deporte'>
          <option value='futbol'>Fútbol</option>
          <option value='padel'>Pádel</option>
        </select>
      </label>
      <label htmlFor='fecha' id='fecha'>
        Fecha
        <input type='date' name='fecha' id='fecha' />
      </label>
      <label htmlFor='turno' id='turno'>
        Turno
        <select name='turno' id='turno'>
          <option value='mañana'>Mañana</option>
          <option value='tarde'>Tarde</option>
          <option value='noche'>Noche</option>
        </select>
      </label>
      <button>Buscar</button>
    </form>
  )
}

export default FormReservas
