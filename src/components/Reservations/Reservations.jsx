'use client'
import { useState } from 'react'
import styles from './Reservations.module.css'
import StepOne from './StepReservation/StepOne'
import StepTwo from './StepReservation/StepTwo'
import imagen_logo from '@/assets/images/logos/Recurso 14_023535.png'
import Image from 'next/image'

const Reservations = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  return (
    <div className={styles.container}>
      <div
        className={styles.content}
        style={step === 1 ? { paddingTop: '200px' } : { paddingTop: '150px' }}
      >
        <div className={styles.container_form}>
          {step === 1 && (
            <Image
              src={imagen_logo}
              alt='logo'
              width={200}
              height={200}
              className={styles.logo}
            />
          )}
          {step === 1 && (
            <StepOne
              setStep={setStep}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
          {step === 2 && (
            <StepTwo
              setStep={setStep}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Reservations
