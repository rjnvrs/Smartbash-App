"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"

const defaultMarkerIcon = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 17, { animate: true })
  }, [center, map])
  return null
}

function PinMarker({
  center,
  onChange,
}: {
  center: [number, number]
  onChange: (lat: number, lng: number) => void
}) {
  const [position, setPosition] = useState<[number, number]>(center)
  const markerRef = useRef<L.Marker | null>(null)

  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setPosition([e.latlng.lat, e.latlng.lng])
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return

    const onDragEnd = () => {
      const p = marker.getLatLng()
      setPosition([p.lat, p.lng])
      onChange(p.lat, p.lng)
    }

    marker.on("dragend", onDragEnd)
    return () => {
      marker.off("dragend", onDragEnd)
    }
  }, [onChange])

  return <Marker position={position} draggable ref={markerRef} icon={defaultMarkerIcon} />
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
        key={`${mapCenter[0]}-${mapCenter[1]}`}
        center={mapCenter}
        onChange={(lat, lng) => setLocation(`Lat: ${lat}, Lng: ${lng}`)}
      />
    </MapContainer>
  )
}
