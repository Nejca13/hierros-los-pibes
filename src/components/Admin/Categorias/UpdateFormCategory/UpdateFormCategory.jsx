'use client'
import styles from './UpdateFormCategory.module.css'
import Spinner from '@/components/Spinner/Spinner'
import { upadateCategories } from '@/services/categories/categories'
import { useRef, useState } from 'react'
import Swal from 'sweetalert2'
import EmojiPicker from 'emoji-picker-react'
import Emoji from '@/assets/icons/Emoji'

const UpdateFormCategory = ({ selectedCategorie, refresh, onClose }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEmoji, setSelectedEmoji] = useState(
    selectedCategorie?.icon || ''
  )
  const [showPicker, setShowPicker] = useState(false)

  const pickerRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formDataRaw = Object.fromEntries(new FormData(e.target))

    if (formDataRaw.name === selectedCategorie.name) delete formDataRaw.name
    if (selectedEmoji === selectedCategorie.icon) delete formDataRaw.icon
    else formDataRaw.icon = selectedEmoji // usamos el emoji actualizado

    if (Object.keys(formDataRaw).length === 0) {
      setError('Realiza cambios para poder actualizar la categoría')
      setIsLoading(false)
      return
    }

    const formData = {
      name: formDataRaw.name || selectedCategorie?.name,
      icon: formDataRaw.icon || selectedCategorie?.icon,
    }

    await upadateCategories(selectedCategorie?._id, formData)
      .then((response) => {
        if (!response.success) {
          setError(
            response.detail || 'Ocurrió un error al actualizar la categoría.'
          )
          return
        }

        Swal.fire({
          icon: 'success',
          title: 'Categoría actualizada',
          text: 'La categoría se actualizó correctamente.',
          confirmButtonColor: '#8B5E3C',
        }).then(() => {
          onClose()
          refresh()
        })
      })
      .catch((error) => {
        console.log(error)
        setError('Hubo un error al actualizar la categoría.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleEmojiClick = (emojiData) => {
    setSelectedEmoji(emojiData.emoji)
    setShowPicker(false)
  }

  return (
    <div className={styles.container_form}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor='name' className={styles.label}>
          Nombre de la categoría
          <input
            className={styles.input}
            type='text'
            name='name'
            id='name'
            placeholder='Nombre de la categoría'
            defaultValue={selectedCategorie?.name}
          />
        </label>

        <label htmlFor='icon' className={styles.label}>
          Icono de la categoría
          <input
            className={styles.input}
            type='text'
            name='icon'
            id='icon'
            value={selectedEmoji}
            placeholder='Seleccioná un icono'
            readOnly
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                setSelectedEmoji('')
              }
            }}
          />
          <button
            type='button'
            className={styles.emoji_button}
            onClick={(e) => {
              e.stopPropagation()
              setShowPicker((prev) => !prev)
            }}
          >
            <Emoji />
          </button>
        </label>

        <button type='submit' className={styles.button_submith}>
          {isLoading ? <Spinner /> : 'Actualizar categoría'}
        </button>

        {error && <small className={styles.error}>{error}</small>}
      </form>
      {showPicker && (
        <div className={styles.emoji_picker} ref={pickerRef}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            searchDisabled
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  )
}

export default UpdateFormCategory
