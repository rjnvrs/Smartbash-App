'use client'

import { useState, useRef, useEffect } from 'react'
import Camera from './Camera'
import { MapPin, Upload, Send, Flame, Waves } from 'lucide-react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'

/* ================= LEAFLET ICON FIX ================= */
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type IncidentType = 'Fire' | 'Flood'

/* ================= AUTO FLY TO LOCATION ================= */
function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, 17, {
      animate: true,
      duration: 0.8,
    })
  }, [center])

  return null
}

/* ================= PIN MARKER ================= */
function PinMarker({
  center,
  onChange,
}: {
  center: [number, number]
  onChange: (lat: number, lng: number) => void
}) {
  const [position, setPosition] = useState<[number, number]>(center)

  useEffect(() => {
    setPosition(center)
  }, [center])

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      onChange(lat, lng)
    },
  })

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const m = e.target as any
          const p = m.getLatLng()
          setPosition([p.lat, p.lng])
          onChange(p.lat, p.lng)
        },
      }}
    />
  )
}

/* ================= MAIN FORM ================= */
export default function IncidentForm() {
  const [incidentType, setIncidentType] = useState<IncidentType>('Fire')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    14.5995, 120.9842,
  ])
  const [images, setImages] = useState<string[]>([])
  const [capturing, setCapturing] = useState(false)

  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  /* ================= CAMERA ================= */
  const startCamera = async () => {
    setCapturing(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    } catch {
      alert('Unable to access camera')
      setCapturing(false)
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !video.srcObject || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    setImages((p) => [...p, canvas.toDataURL('image/png')])

    ;(video.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
    video.srcObject = null
    setCapturing(false)
  }

  const cancelCapture = () => {
    ;(videoRef.current?.srcObject as MediaStream | null)
      ?.getTracks()
      ?.forEach((t) => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCapturing(false)
  }

  /* ================= AUTO SEARCH ================= */
  const autoSearchWhileTyping = (value: string) => {
    setLocation(value)

    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    if (value.trim().length < 4) return

    typingTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            value
          )}`,
          { headers: { 'User-Agent': 'Smartbash-App' } }
        )

        const data = await res.json()
        if (!data?.length) return

        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)

        setMapCenter([lat, lng])
        setLocation(data[0].display_name)
      } catch {}
    }, 600)
  }

  /* ================= 📍 BUTTON ================= */
  const openOpenStreetMap = () => {
    if (!location.trim()) return
    window.open(
      `https://www.openstreetmap.org/search?query=${encodeURIComponent(
        location
      )}`,
      '_blank'
    )
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newPost = {
      id: Date.now(),
      author: 'Mikaylgoan@gmail.com',
      time: 'Just now',
      postType: 'EVENT',
      incidentType,
      location,
      content: description,
      image: images[0],
      interested: false,
      saved: false,
    }

    const existing = JSON.parse(
      localStorage.getItem('newsfeed') || '[]'
    )

    localStorage.setItem(
      'newsfeed',
      JSON.stringify([newPost, ...existing])
    )

    alert('Report submitted successfully')

    setDescription('')
    setLocation('')
    setImages([])
    setIncidentType('Fire')
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl">
        <div className="px-8 pt-8">
          <h2 className="text-xl font-semibold">
            Report an Environmental Incident
          </h2>
        </div>

        <div className="px-8 py-6">
          {/* FIRE / FLOOD */}
          <div className="flex gap-6 mb-8">
            <button
              type="button"
              onClick={() => setIncidentType('Fire')}
              className={`flex-1 rounded-xl p-6 border ${
                incidentType === 'Fire'
                  ? 'bg-red-100 border-red-400'
                  : 'bg-red-50'
              }`}
            >
              <Flame className="mx-auto w-10 h-10 text-red-600" />
              <p className="mt-2 font-semibold text-red-700">Fire</p>
            </button>

            <button
              type="button"
              onClick={() => setIncidentType('Flood')}
              className={`flex-1 rounded-xl p-6 border ${
                incidentType === 'Flood'
                  ? 'bg-blue-100 border-blue-400'
                  : 'bg-blue-50'
              }`}
            >
              <Waves className="mx-auto w-10 h-10 text-blue-600" />
              <p className="mt-2 font-semibold text-blue-700">Flood</p>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-28 border rounded-xl px-4 py-3 mb-6"
              placeholder="Describe the incident"
              required
            />

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  value={location}
                  onChange={(e) => autoSearchWhileTyping(e.target.value)}
                  placeholder="Type street, barangay, city..."
                  className="flex-1 border rounded-xl px-4 py-3"
                />
                <button
                  type="button"
                  onClick={openOpenStreetMap}
                  className="px-4 rounded-xl bg-gray-600 text-white"
                >
                  <MapPin />
                </button>
              </div>
            </div>

            {/* MAP — HIDDEN WHILE CAMERA IS OPEN */}
            {!capturing && (
              <MapContainer
                center={mapCenter}
                zoom={17}
                style={{ height: '300px', width: '100%' }}
                className="rounded-xl mb-6"
              >
                <FlyToLocation center={mapCenter} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <PinMarker
                  center={mapCenter}
                  onChange={(lat, lng) => {
                    setMapCenter([lat, lng])
                    setLocation(
                      `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
                    )
                  }}
                />
              </MapContainer>
            )}

            {/* CAMERA */}
            <div
              className="border-2 border-dashed rounded-2xl p-6 text-center bg-gray-50 cursor-pointer mb-6"
              onClick={() => !capturing && startCamera()}
            >
              {images.length > 0 && !capturing ? (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="rounded-xl max-h-40 object-cover"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <Upload className="mx-auto w-12 h-12 mb-2 text-gray-500" />
                  Click to take photo
                </>
              )}
            </div>

            {capturing && (
              <Camera
                videoRef={videoRef}
                capturePhoto={capturePhoto}
                cancelCapture={cancelCapture}
              />
            )}

            <canvas ref={canvasRef} className="hidden" />

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl hover:bg-green-800"
            >
              <Send />
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
