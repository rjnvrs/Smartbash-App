"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"

/* Leaflet icon fix */
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 17, { animate: true })
  }, [center])
  return null
}

function PinMarker({
  center,
  onChange,
}: {
  center: [number, number]
  onChange: (lat: number, lng: number) => void
}) {
  const [position, setPosition] = useState(center)

  useEffect(() => setPosition(center), [center])

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const p = (e.target as any).getLatLng()
          setPosition([p.lat, p.lng])
          onChange(p.lat, p.lng)
        },
      }}
    />
  )
}

export default function IncidentMap({
  mapCenter,
  setLocation,
}: {
  mapCenter: [number, number]
  setLocation: (v: string) => void
}) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={17}
      style={{ height: 300 }}
      className="rounded-xl z-0"
    >
      <FlyToLocation center={mapCenter} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <PinMarker
        center={mapCenter}
        onChange={(lat, lng) => setLocation(`Lat: ${lat}, Lng: ${lng}`)}
      />
    </MapContainer>
  )
}
