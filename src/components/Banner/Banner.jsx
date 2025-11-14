'use client'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import styles from './Banner.module.css'

const Banner = () => {
  const slogans = [
    {
      title: 'Tu Partido, Tu Lugar',
      description:
        'Encuentra y reserva fácilmente canchas de fútbol y pádel. Horarios flexibles, espacios de calidad y todo listo para que disfrutes tu juego.',
    },
    {
      title: 'Vení a Jugar',
      description:
        'Tu próximo partido te está esperando. Alquilá canchas equipadas, cerca tuyo, y viví el deporte con la mejor experiencia.',
    },
    {
      title: 'Reservá en un Click',
      description:
        'Olvidate de las complicaciones. Elegí tu cancha, horario y listo. Todo rápido, seguro y diseñado para vos.',
    },
  ]

  const carouselSettings = {
    autoPlay: true,
    showArrows: false,
    showThumbs: false,
    showStatus: false,
    infiniteLoop: true,
    showIndicators: false,
    interval: 7000,
  }

  return (
    <div className={styles.container}>
      <Carousel {...carouselSettings} className={styles.carousel}>
        {slogans.map((slogan, index) => (
          <div key={index} className={styles.slide}>
            <h2>{slogan.title}</h2>
            <p>{slogan.description}</p>
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default Banner
