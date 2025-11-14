import Image from 'next/image'
import styles from './Marcas.module.css'
import { logos } from './img_marcas'

const Marcas = () => {
  return (
    <div className={styles.slider}>
      <div className={styles.move}>
        {logos.map((image, index) => (
          <div className={styles.box} key={index}>
            <Image src={image} alt='' width={150} height={150} />
          </div>
        ))}
        {/* 2da vuelta */}
        {logos.map((image, index) => (
          <div className={styles.box} key={index}>
            <Image src={image} alt='' width={150} height={150} />
          </div>
        ))}
        {logos.map((image, index) => (
          <div className={styles.box} key={index}>
            <Image src={image} alt='' width={150} height={150} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Marcas
