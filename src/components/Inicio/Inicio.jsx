'use client'
import HandDrawLeft from '@/assets/icons/HandDrawLeft'
import styles from './Inicio.module.css'
import ArrowHandDraw from '@/assets/icons/ArrowHandDraw'
import CartCoffe from '../CartCoffe/CartCoffe'

const Inicio = () => {
  return (
    <section className={styles.container} id='home'>
      <div className={styles.content} id='title'>
        <h1>
          <div className={styles.handDraw}>
            <HandDrawLeft width='40px' height='40px' color='var(--black)' />
            <HandDrawLeft
              width='40px'
              height='40px'
              color='var(--black)'
              mirrored={true}
            />
          </div>
          Sabor que Abraza
        </h1>
        <h2>
          Desayunos, almuerzos y meriendas con amor. Tu nuevo punto de encuentro
          💛
        </h2>
        <div className={styles.button_and_arrow}>
          <button onClick={() => (window.location.href = '#menu')}>
            Explorar Menu
          </button>
          <i className={styles.ArrowHandDraw}>
            <ArrowHandDraw width='100px' height='100px' color='var(--black)' />
          </i>
        </div>
      </div>
      <CartCoffe />
    </section>
  )
}

export default Inicio
