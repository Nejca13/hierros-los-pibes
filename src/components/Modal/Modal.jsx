import { createPortal } from 'react-dom'
import styles from './Modal.module.css'
import Close from '@/assets/icons/Close'

const Modal = ({ isModalOpen, onClose, children, maxWidth = '500px' }) => {
  if (!isModalOpen) return null
  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <button className={styles.closeButton} onClick={onClose}>
        <Close color='rgb(55, 55, 55)' />
      </button>
      <div className={styles.modal} style={{ maxWidth: maxWidth }}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal
