'use client'
import Clock from '@/assets/icons/Clock'
import Email from '@/assets/icons/Email'
import Facebook from '@/assets/icons/Facebook'
import Instagram from '@/assets/icons/Instagram'
import Location from '@/assets/icons/Location'
import Mobile from '@/assets/icons/Mobile'
import Whatsapp from '@/assets/icons/Whatsapp'
import logo from '@/assets/images/logos/Recurso 13_023532.png'
import Image from 'next/image'
import Link from 'next/link'
import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.container}>
      <div className={styles.full_content}>
        <div className={styles.content_list}>
          <div className={styles.logo}>
            <Image
              src={logo}
              alt='logo'
              width={100}
              height={100}
              style={{ borderRadius: '50%' }}
            />
            <div className={styles.text}>
              <h3>sportiumcafe</h3>
              <span>Canchas de futbol y padel </span>
            </div>
          </div>
          <div className={styles.list}>
            <h5>Información</h5>
            <ul>
              <Link href='https://wa.me/+5491138057161' target='_blank'>
                <li>
                  <Mobile color='white' />
                  +54 9 11 3805-7161
                </li>
              </Link>
              <Link href='mailto:infopanchos222@gmail.com' target='_blank'>
                <li>
                  <Email color='white' />
                  infopanchos222@gmail.com
                </li>
              </Link>
              <Link
                href="https://www.google.com/maps/place/34%C2%B034'30.7%22S+58%C2%B023'52.0%22W/@-34.575188,-58.397771,17z/data=!3m1!4b1!4m4!3m3!8m2!3d-34.575188!4d-58.397771?entry=ttu&g_ep=EgoyMDI1MDEyMS4wIKXMDSoASAFQAw%3D%3D"
                target='_blank'
                rel='noopener noreferrer'
              >
                <li>
                  <Location color='white' />
                  sportiumcafe Ubicación
                </li>
              </Link>
              <li>
                <Clock color='white' />
                <p>LUN-DOM: 9:00 AM - 00:00 PM</p>
              </li>
            </ul>
          </div>
          <div className={styles.social}>
            <h5>Redes Sociales</h5>
            <div className={styles.social_list}>
              <Link
                href='https://www.facebook.com/profile.php?id=100089499019169'
                target='_blank'
              >
                <span>
                  <Facebook color='white' />
                </span>
              </Link>
              <Link
                href='https://www.instagram.com/cerrajeriadelvalle33_'
                target='_blank'
              >
                <span>
                  <Instagram color='white' />
                </span>
              </Link>
              <Link
                href='https://wa.me/5491138057161'
                target='_blank'
                rel='noopener noreferrer'
              >
                <span>
                  <Whatsapp color='white' />
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.copyright}>
          <p>© 2025, Todos los derechos reservados sportiumcafe.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
