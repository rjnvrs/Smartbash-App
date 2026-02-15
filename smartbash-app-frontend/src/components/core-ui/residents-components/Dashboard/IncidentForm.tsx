"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Flame, MapPin, Send, Upload, Waves } from "lucide-react"
import { apiFetch } from "@/lib/api"
import Camera from "./Camera"

const IncidentMap = dynamic(() => import("./IncidentMap"), { ssr: false })

type IncidentType = "Fire" | "Flood"

type Suggestion = {
  display_name: string
  lat: string
  lon: string
}

export default function IncidentForm() {
  const router = useRouter()

  const [incidentType, setIncidentType] = useState<IncidentType>("Fire")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842])
  const [images, setImages] = useState<string[]>([])
  const [capturing, setCapturing] = useState(false)
  const [cameraMessage, setCameraMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showInputPicker, setShowInputPicker] = useState(false)

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const startCamera = async () => {
    setCameraMessage("")

    // Camera is blocked on non-secure origins (e.g. LAN IP over HTTP).
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraMessage("Camera is blocked on insecure connection. Use Upload Image instead.")
      fileInputRef.current?.click()
      return
    }

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
      setCameraMessage("Camera access denied. Use Upload Image instead.")
      setCapturing(false)
      fileInputRef.current?.click()
    }
  }

  const openCaptureOptions = () => setShowInputPicker(true)

  const handleFallbackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result === "string") setImages((prev) => [...prev, result])
    }
    reader.readAsDataURL(file)
    e.target.value = ""
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
    setImages((prev) => [...prev, canvas.toDataURL("image/png")])

    ;(video.srcObject as MediaStream | null)?.getTracks()?.forEach((track) => track.stop())
    video.srcObject = null
    setCapturing(false)
  }

  const cancelCapture = () => {
    ;(videoRef.current?.srcObject as MediaStream | null)?.getTracks()?.forEach((track) => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCapturing(false)
  }

  const autoSearchWhileTyping = async (value: string) => {
    setLocation(value)

    if (typingTimeout.current) clearTimeout(typingTimeout.current)

    if (value.length < 3) {
      setSuggestions([])
      return
    }

    typingTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(value)}`
        )
        const data = (await res.json()) as Suggestion[]
        setSuggestions(Array.isArray(data) ? data : [])
      } catch {
        setSuggestions([])
      }
    }, 400)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await apiFetch("/auth/residents/incidents/create/", {
        method: "POST",
        body: JSON.stringify({
          type: incidentType,
          description,
          location,
          images,
          lat: mapCenter[0],
          lng: mapCenter[1],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to submit report")

      setDescription("")
      setLocation("")
      setImages([])
      setIncidentType("Fire")
      router.push("/dashboards/residents/reports")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit report"
      window.alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start px-4 py-10">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 mt-6">
        <h2 className="text-xl font-semibold mb-6">Report an Environmental Incident</h2>

        <div className="flex gap-6 mb-6">
          <button
            type="button"
            onClick={() => setIncidentType("Fire")}
            className={`flex-1 p-6 rounded-xl border ${
              incidentType === "Fire" ? "bg-red-100 border-red-400" : "bg-red-50"
            }`}
          >
            <Flame className="mx-auto text-red-600" />
            Fire
          </button>

          <button
            type="button"
            onClick={() => setIncidentType("Flood")}
            className={`flex-1 p-6 rounded-xl border ${
              incidentType === "Flood" ? "bg-blue-100 border-blue-400" : "bg-blue-50"
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

          <div className="flex gap-2 mb-4 relative">
            <div className="relative flex-1 z-[1000]">
              <input
                value={location}
                onChange={(e) => autoSearchWhileTyping(e.target.value)}
                className="w-full border rounded-xl p-3 relative z-[1000]"
                placeholder="Barangay, street, city"
              />

              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 bg-white border rounded-xl shadow-lg w-full max-h-48 overflow-auto z-[1000]">
                  {suggestions.map((s, i) => (
                    <div
                      key={`${s.lat}-${s.lon}-${i}`}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setLocation(s.display_name)
                        setMapCenter([parseFloat(s.lat), parseFloat(s.lon)])
                        setSuggestions([])
                      }}
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`,
                  "_blank"
                )
              }
              className="px-4 bg-gray-700 text-white rounded-xl z-[1000]"
            >
              <MapPin />
            </button>
          </div>

          <div className={`${capturing ? "hidden" : "block"} mb-6`}>
            <IncidentMap mapCenter={mapCenter} setLocation={setLocation} />
          </div>

          <div
            onClick={() => !capturing && openCaptureOptions()}
            className="border-2 border-dashed rounded-xl p-6 text-center mb-6 cursor-pointer"
          >
            {images.length ? (
              images.map((img, i) => <img key={i} src={img} className="rounded-xl mb-2" alt={`Report ${i + 1}`} />)
            ) : (
              <>
                <Upload className="mx-auto mb-2" />
                Click to take/upload photo of the {incidentType.toLowerCase()}
              </>
            )}
          </div>

          {!!cameraMessage && <p className="text-sm text-amber-700 -mt-3 mb-4">{cameraMessage}</p>}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFallbackUpload}
          />

          {showInputPicker && (
            <div className="fixed inset-0 z-[2100] bg-black/40 flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-5">
                <h3 className="text-base font-semibold mb-2">Add incident photo</h3>
                <p className="text-sm text-gray-600 mb-4">Choose your input source.</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setShowInputPicker(false)
                      await startCamera()
                    }}
                    className="w-full rounded-lg bg-black text-white py-2.5"
                  >
                    Use Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInputPicker(false)
                      setCameraMessage("")
                      fileInputRef.current?.click()
                    }}
                    className="w-full rounded-lg border py-2.5 hover:bg-gray-50"
                  >
                    Upload Picture
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInputPicker(false)}
                    className="w-full rounded-lg py-2 text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

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
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 rounded-xl disabled:opacity-70"
          >
            <Send className="inline mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  )
}
