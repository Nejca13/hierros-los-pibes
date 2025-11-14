'use client'
import styles from './CreateCategoriesForm.module.css'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/Spinner/Spinner'
import Swal from 'sweetalert2'
import { createCategories } from '@/services/categories/categories'
import EmojiPicker from 'emoji-picker-react'
import Emoji from '@/assets/icons/Emoji'

const CreateCategoriesForm = ({ refresh }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState(null)
  const [showPicker, setShowPicker] = useState(false)

  const pickerRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = Object.fromEntries(new FormData(e.target))

    try {
      const response = await createCategories(formData)

      if (!response.success) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al crear la categoría.',
          confirmButtonColor: '#8B5E3C',
        })
        return
      }

      Swal.fire({
        icon: 'success',
        title: 'Categoría creada',
        text: 'La categoría se creó correctamente.',
        confirmButtonColor: '#8B5E3C',
      }).then(() => {
        e.target.reset()
        setSelectedEmoji(null)
        refresh?.()
      })
    } catch (error) {
      console.error('Error al crear la categoría:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error inesperado.',
        confirmButtonColor: '#8B5E3C',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmojiClick = (emojiData) => {
    setSelectedEmoji(emojiData.emoji)
    setShowPicker(false) // Cierra al seleccionar
  }
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showPicker])

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor='name' className={styles.label}>
        Nombre de la categoría
        <input
          className={styles.input}
          required
          type='text'
          name='name'
          id='name'
          placeholder='Nombre de la categoría'
        />
      </label>

      <label htmlFor='icon' className={styles.label}>
        Icono de la categoría
        <div className={styles.emoji_input_wrapper}>
          <input
            className={styles.input}
            required
            type='text'
            name='icon'
            id='icon'
            value={selectedEmoji || ''}
            placeholder='Seleccioná un icono'
            readOnly
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                setSelectedEmoji(null)
              }
            }}
          />
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              setShowPicker((prev) => !prev)
            }}
            className={styles.emoji_button}
          >
            <Emoji />
          </button>
          {showPicker && (
            <div className={styles.emoji_picker} ref={pickerRef}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>
      </label>

      <button type='submit' className={styles.button_submith}>
        {isLoading ? <Spinner /> : 'Crear categoría'}
      </button>
    </form>
  )
}

export default CreateCategoriesForm
