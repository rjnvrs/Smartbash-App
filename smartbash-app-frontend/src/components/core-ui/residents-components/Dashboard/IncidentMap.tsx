"use client"

import { useEffect, useState, useRef } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet"
import L from "leaflet"

/* Leaflet icon fix */
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

/* ================= SAFE FLY TO ================= */

function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap()
  const initialized = useRef(false)

  useEffect(() => {
    if (!map || !center) return

    map.whenReady(() => {
      if (!initialized.current) {
        // First load — no animation
        map.setView(center, 17)
        initialized.current = true
      } else {
        // After first load — animate safely
        map.flyTo(center, 17, { animate: true })
      }
    })
  }, [center, map])

  return null
}

/* ================= MARKER ================= */

function PinMarker({
  center,
  onChange,
}: {
  center: [number, number]
  onChange: (lat: number, lng: number) => void
}) {
  const [position, setPosition] = useState(center)

  useEffect(() => {
    setPosition(center)
  }, [center])

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)
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
          const newPos: [number, number] = [p.lat, p.lng]
          setPosition(newPos)
          onChange(p.lat, p.lng)
        },
      }}
    />
  )
}

/* ================= MAIN MAP ================= */

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

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <PinMarker
        center={mapCenter}
        onChange={(lat, lng) =>
          setLocation(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
        }
      />
    </MapContainer>
  )
}
