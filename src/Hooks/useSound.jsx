import { useRef, useEffect } from 'react'

export default function useSound(src = '/notification.mp3', volume = 0.5) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio(src)
      audioRef.current.volume = volume
    }
  }, [src, volume])

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => {
        console.warn('🔇 No se pudo reproducir el sonido:', err)
      })
    }
  }

  return play
}
