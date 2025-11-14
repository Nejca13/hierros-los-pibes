'use client' // Para habilitar compatibilidad con componentes cliente en Next.js

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './../Contacto.module.css'

// Configurar el ícono predeterminado de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Opción para un ícono personalizado (opcional)
const customIcon = new L.Icon({
  iconUrl: '/location.png', // Cambia esta ruta según tu archivo en `public`
  iconSize: [50, 50], // Tamaño del ícono
  iconAnchor: [20, 40], // Punto de anclaje
})

const MapComponent = () => {
  const position = [-34.625299, -58.412735] // Coordenadas iniciales

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '500px',
        height: '230px',
        marginTop: '10px',
      }}
      className={styles.map}
    >
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Capa del mapa */}
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.carto.com/">CartoDB</a>'
        />

        {/* Marcador con ícono personalizado */}
        <Marker position={position} icon={customIcon}>
          <Popup>¡Aquí estoy con un ícono personalizado!</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default MapComponent
