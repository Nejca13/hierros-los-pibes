'use client'
import styles from './Register.module.css'
import { useEffect, useState } from 'react'
import StepOne from './Steps/StepOne'
import StepTwo from './Steps/StepTwo'
import StepThree from './Steps/StepThree'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useStore from '@/app/store'

const Register = () => {
  const [step, setStep] = useState(1)
  const { currentUser } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (currentUser) {
      router.push('/')
    }
  }, [currentUser, router])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.container_form}>
          {step === 1 && <StepOne setStep={setStep} />}
          {step === 2 && <StepTwo setStep={setStep} />}
          {step === 3 && <StepThree setStep={setStep} />}
          {step !== 3 && (
            <Link href={'/login'} className={styles.link}>
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register
