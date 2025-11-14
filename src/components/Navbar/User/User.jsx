import useStore from '@/app/store'
import styles from './User.module.css'
import Image from 'next/image'

const User = () => {
  const { currentUser } = useStore()

  return (
    <div className={styles.user}>
      <div className={styles.avatar}>
        <Image
          src={currentUser?.user?.img}
          alt='avatar'
          width={50}
          height={50}
          priority
        />
      </div>
    </div>
  )
}

export default User
