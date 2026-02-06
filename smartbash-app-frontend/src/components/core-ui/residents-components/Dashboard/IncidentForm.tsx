"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Camera from "./Camera"
import { MapPin, Upload, Send, Flame, Waves } from "lucide-react"
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet"
import L from "leaflet"

/* ================= LEAFLET ICON FIX ================= */
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

type IncidentType = "Fire" | "Flood"

/* ================= AUTO FLY ================= */
function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, 17, { animate: true, duration: 0.8 })
  }, [center])

  return null
}

/* ================= PIN ================= */
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

/* ================= MAIN ================= */
export default function IncidentForm() {
  const router = useRouter()

  const [incidentType, setIncidentType] =
    useState<IncidentType>("Fire")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    14.5995,
    120.9842,
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
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      alert("Camera access denied")
      setCapturing(false)
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    setImages((p) => [...p, canvas.toDataURL("image/png")])

    ;(video.srcObject as MediaStream)
      .getTracks()
      .forEach((t) => t.stop())

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

  /* ================= SEARCH ================= */
  const autoSearchWhileTyping = (value: string) => {
    setLocation(value)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    if (value.trim().length < 4) return

    typingTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            value
          )}`
        )
        const data = await res.json()
        if (!data?.length) return
        setMapCenter([
          parseFloat(data[0].lat),
          parseFloat(data[0].lon),
        ])
        setLocation(data[0].display_name)
      } catch {}
    }, 600)
  }

  /* ================= SUBMIT (FINAL FIX) ================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newReport = {
      id: Date.now(),
      type: incidentType.toLowerCase() as "fire" | "flood",
      status: "waiting",
      description,
      location,
      images,
      createdAt: Date.now(),
    }

    const existingReports = JSON.parse(
      localStorage.getItem("incident_reports") || "[]"
    )

    localStorage.setItem(
      "incident_reports",
      JSON.stringify([newReport, ...existingReports])
    )

    setDescription("")
    setLocation("")
    setImages([])
    setIncidentType("Fire")

    // ✅ CORRECT ROUTE
    router.push("/dashboards/residents/reports")
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-semibold mb-6">
          Report an Environmental Incident
        </h2>

        {/* TYPE */}
        <div className="flex gap-6 mb-6">
          <button
            type="button"
            onClick={() => setIncidentType("Fire")}
            className={`flex-1 p-6 rounded-xl border ${
              incidentType === "Fire"
                ? "bg-red-100 border-red-400"
                : "bg-red-50"
            }`}
          >
            <Flame className="mx-auto text-red-600" />
            Fire
          </button>

          <button
            type="button"
            onClick={() => setIncidentType("Flood")}
            className={`flex-1 p-6 rounded-xl border ${
              incidentType === "Flood"
                ? "bg-blue-100 border-blue-400"
                : "bg-blue-50"
            }`}
          >
            <Waves className="mx-auto text-blue-600" />
            Flood
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-28 border rounded-xl p-4 mb-4"
            placeholder="Describe the incident"
            required
          />

          <div className="flex gap-2 mb-4">
            <input
              value={location}
              onChange={(e) => autoSearchWhileTyping(e.target.value)}
              className="flex-1 border rounded-xl p-3"
              placeholder="Barangay, street, city"
            />
            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://www.openstreetmap.org/search?query=${encodeURIComponent(
                    location
                  )}`,
                  "_blank"
                )
              }
              className="px-4 bg-gray-700 text-white rounded-xl"
            >
              <MapPin />
            </button>
          </div>

          {!capturing && (
            <MapContainer
              center={mapCenter}
              zoom={17}
              style={{ height: 300 }}
              className="rounded-xl mb-6"
            >
              <FlyToLocation center={mapCenter} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <PinMarker
                center={mapCenter}
                onChange={(lat, lng) =>
                  setLocation(`Lat: ${lat}, Lng: ${lng}`)
                }
              />
            </MapContainer>
          )}

          <div
            onClick={() => !capturing && startCamera()}
            className="border-2 border-dashed rounded-xl p-6 text-center mb-6 cursor-pointer"
          >
            {images.length ? (
              images.map((img, i) => (
                <img key={i} src={img} className="rounded-xl mb-2" />
              ))
            ) : (
              <>
                <Upload className="mx-auto mb-2" />
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
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            <Send className="inline mr-2" />
            Submit Report
          </button>
        </form>
      </div>
    </div>
  )
}
