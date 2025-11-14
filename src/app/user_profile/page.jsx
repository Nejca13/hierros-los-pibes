'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from './page.module.css'
import useStore from '../store'
import Modal from '@/components/Modal/Modal'
import EditUserForm from '@/components/EditUserForm/EditUserForm'
import ChangePasswordForm from '@/components/ChangePasswordForm/ChangePasswordForm'

const UserProfilePage = () => {
  const { currentUser } = useStore()
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mi perfil</h1>

      <div className={styles.card}>
        <Image
          src={currentUser?.user?.img || '/default-avatar.png'}
          alt='Foto de perfil'
          width={130}
          height={130}
          className={styles.avatar}
        />
        <div className={styles.info}>
          <h2>
            {currentUser?.user?.name} {currentUser?.user?.last_name}
          </h2>
          <span>{currentUser?.user?.email}</span>
          <p>Telefono: {currentUser?.user?.phone_number || 'No cargado'}</p>
        </div>

        <div className={styles.buttons}>
          <button
            className={styles.button}
            onClick={() => setEditModalOpen(true)}
          >
            Editar perfil
          </button>
          <button
            className={styles.button}
            onClick={() => setPasswordModalOpen(true)}
          >
            Cambiar contraseña
          </button>
        </div>
      </div>

      <Modal
        isModalOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <EditUserForm
          defaultValues={currentUser?.user}
          onClose={() => setEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isModalOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      >
        <ChangePasswordForm
          userId={currentUser?.user.id}
          onClose={() => setPasswordModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default UserProfilePage
