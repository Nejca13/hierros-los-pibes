import { useEffect, useRef } from 'react'

export function useWebSocket(role, onMessage, onReconnect) {
  const socketRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const timeoutRef = useRef(null)

  // refs para callbacks
  const onMessageRef = useRef(onMessage)
  const onReconnectRef = useRef(onReconnect)

  // actualizo refs cada render
  useEffect(() => {
    onMessageRef.current = onMessage
    onReconnectRef.current = onReconnect
  }, [onMessage, onReconnect])

  const maxReconnectAttempts = 5
  const reconnectInterval = 5000

  const connect = () => {
    const LOCAL_WS = `ws://localhost:8000/ws/${role}/`
    const PROD_WS = `wss://sportiumcafe.com/ws/${role}/`
    const wsUrl = process.env.NODE_ENV === 'production' ? PROD_WS : LOCAL_WS

    console.log(`🌐 Conectando al WebSocket (${role}) en ${wsUrl}`)
    socketRef.current = new WebSocket(wsUrl)

    socketRef.current.onopen = () => {
      console.log(`🟢 Conectado al WebSocket (${role})`)
      if (onReconnectRef.current && reconnectAttemptsRef.current > 0) {
        console.log(
          `🔄 Reconectado tras ${reconnectAttemptsRef.current} intento(s)`
        )
        onReconnectRef.current()
      }
      reconnectAttemptsRef.current = 0
    }

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 Mensaje recibido:', data)
        onMessageRef.current(data)
      } catch (error) {
        console.error('Error parseando mensaje:', error)
      }
    }

    socketRef.current.onclose = (event) => {
      console.log(`🔴 WebSocket cerrado (${role})`, event.code, event?.reason)
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(
          reconnectInterval * (reconnectAttemptsRef.current + 1),
          30000
        )
        console.log(
          `🔄 Reintentando en ${delay / 1000}s… (Intento ${
            reconnectAttemptsRef.current + 1
          }/${maxReconnectAttempts})`
        )
        timeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1
          connect()
        }, delay)
      } else {
        console.log(`❌ Máximo de intentos alcanzado (${maxReconnectAttempts})`)
        if (typeof window !== 'undefined') {
          setTimeout(() => window.location.reload(), 3000)
        }
      }
    }

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  useEffect(() => {
    connect()
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // sólo se vuelve a crear el socket si cambia `role`
  }, [role])
}
