import { useEffect } from 'react'

export default function useRequestAudioPermission() {
  useEffect(() => {
    const request = async () => {
      if (typeof window === 'undefined') return

      const audio = new Audio()
      try {
        await audio.play()
        audio.pause()
      } catch (err) {
        // Silenciosamente ignorado, el usuario debe interactuar primero
        console.log('🔒 Permiso de audio aún no otorgado')
      }
    }

    const handleClick = () => {
      request()
      window.removeEventListener('click', handleClick)
    }

    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])
}
