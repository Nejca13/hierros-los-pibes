import img_logo from '@/assets/images/logos/Recurso 14_023535.png'
import Image from 'next/image'
import styles from './SobreNosotros.module.css'

const SobreNosotros = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Image src={img_logo} alt='sobre nosotros' width={400} height={400} />
        <div className={styles.text}>
          <p>
            En <strong style={{ color: 'var(--green)' }}>sportiumcafe</strong>,
            nos apasiona ofrecerte la mejor experiencia deportiva. Somos una
            plataforma dedicada al alquiler de canchas de fútbol y pádel,
            diseñada para que puedas disfrutar de tus partidos, entrenamientos y
            eventos de forma rápida, fácil y confiable.
          </p>

          <p>
            Nuestro objetivo es brindarte acceso a las mejores canchas
            disponibles en tu zona, con un sistema de reserva en línea intuitivo
            y eficiente. Ya sea para un partido entre amigos, una práctica
            profesional o un evento deportivo especial, en sportiumcafe
            encontrarás el espacio perfecto. Nos encontramos ubicados a pocos
            metros del Paseo Alcorta, lo que te permite combinar tu pasión por
            el deporte con la comodidad de una ubicación privilegiada.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SobreNosotros
