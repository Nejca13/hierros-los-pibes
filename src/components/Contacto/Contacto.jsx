'use client'
import HandDrawLine from '@/assets/icons/HandDrawLine'
import IoMdMail from '@/assets/icons/IoMdMail'
import Location from '@/assets/icons/Location'
import Phone from '@/assets/icons/Phone'
import Link from 'next/link'
import { useState } from 'react'
import styles from './Contacto.module.css'

const Contacto = () => {
  const [isLoading, setIsLoading] = useState(false)

  const contactInfo = [
    {
      title: 'Contactanos',
      text: '¿Tenés dudas? Estamos para ayudarte.',
      icon: <Phone width='11' height='11' color='white' />,
      phone: '+54 9 11 3918-8208',
      link: 'https://wa.me/5491139188208',
    },
    {
      title: 'Visitá nuestro local',
      text: 'Acercate a disfrutar de tu desayuno o almuerzo en un ambiente acogedor.',
      icon: <Location width='11' height='11' color='white' />,
      location: 'Av. de Circunvalación 2162 - BA',
      link: 'https://maps.app.goo.gl/G2MfVwnB4c5VKKAy5',
    },
    {
      title: 'Consultas por email',
      text: 'Escribinos para cualquiera de tus consultas. Te responderemos a la brevedad.',
      icon: <IoMdMail width='11' height='11' color='white' />,
      email: 'info@sportiumcafe.com',
      link: 'mailto:info@sportiumcafe.com',
    },
  ]

  return (
    <section className={styles.container} id='contact'>
      <div className={styles.content}>
        <div className={styles.info_text}>
          <h2>Contactanos</h2>
          <HandDrawLine color='var(--black)' />
        </div>
        <div className={styles.form_and_data}>
          {/* formulario de contacto */}
          <form>
            <div className={styles.title}>
              <h3>Envíanos un mensaje</h3>
              <p>
                Déjanos tu consulta y te responderemos lo antes posible, estamos
                aquí para ayudarte a resolver tus dudas.
              </p>
            </div>
            <div className={styles.form_group}>
              <label htmlFor='nombre'>
                Nombre Completo
                <input
                  type='text'
                  id='nombre'
                  name='nombre'
                  placeholder='Nombre completo'
                  required
                />
              </label>
              <label htmlFor='email'>
                Correo electrónico
                <input
                  type='email'
                  id='email'
                  name='email'
                  placeholder='ejemplo@gmail.com'
                  required
                />
              </label>
            </div>
            <div className={styles.form_group}>
              <label htmlFor='telefono'>
                Teléfono
                <input
                  type='tel'
                  id='telefono'
                  name='telefono'
                  placeholder='Ejemplo: 11 2345 6789'
                  required
                />
              </label>
            </div>
            <label htmlFor='mensaje'>
              Mensaje
              <textarea
                id='mensaje'
                name='mensaje'
                placeholder='Tu consulta aquí'
                required
              />
            </label>
            <div className={styles.container_button}>
              <button type='submit' disabled={isLoading}>
                {isLoading ? <Spinner /> : 'Enviar consulta'}
              </button>
            </div>
          </form>

          {/* línea de separación */}
          <div className={styles.line}></div>

          {/* información de contacto */}
          <div className={styles.info_contact}>
            {contactInfo.map((info, index) => (
              <div key={index} className={styles.card}>
                <i className={styles.icon_mobile}>{info.icon}</i>
                <h4>{info.title}</h4>
                <p>{info.text}</p>
                <Link
                  href={info.link}
                  className={styles.icon_text}
                  target='_blank'
                  aria-label={info.phone || info.location || info.email}
                >
                  <i>{info.icon}</i>
                  <span>{info.phone || info.location || info.email}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contacto
