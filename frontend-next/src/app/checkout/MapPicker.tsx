'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

type MapPickerProps = {
  selectedLocation: { lat: number; lng: number } | null
  onSelect: (lat: number, lng: number) => void
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapPicker({ selectedLocation, onSelect }: MapPickerProps) {
  const mapCenter: LatLngExpression = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [47.92123, 106.918556]

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onSelect={onSelect} />
      {selectedLocation && (
        <CircleMarker
          center={[selectedLocation.lat, selectedLocation.lng] as LatLngExpression}
          radius={8}
          pathOptions={{ color: '#111827', fillColor: '#111827', fillOpacity: 0.9 }}
        />
      )}
    </MapContainer>
  )
}


