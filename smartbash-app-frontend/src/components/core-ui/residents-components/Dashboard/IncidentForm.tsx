"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Camera from "./Camera"
import { MapPin, Upload, Send, Flame, Waves } from "lucide-react"

const IncidentMap = dynamic(() => import("./IncidentMap"), { ssr: false })

type IncidentType = "Fire" | "Flood"

export default function IncidentForm() {
  const router = useRouter()

  /* DEFAULT INCIDENT TYPE (NOT CLICKABLE) */
  const incidentType: IncidentType = "Fire"

  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842])
  const [images, setImages] = useState<string[]>([])
  const [capturing, setCapturing] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

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
    setImages((prev) => [...prev, canvas.toDataURL("image/png")])

    ;(video.srcObject as MediaStream)?.getTracks()?.forEach((t) => t.stop())
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

  /* ================= LOCATION SEARCH ================= */

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
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
            value
          )}`
        )
        const data = await res.json()
        setSuggestions(data)
      } catch {}
    }, 400)
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const now = Date.now()

    const report = {
      id: now,
      type: incidentType.toLowerCase(),
      status: "waiting",
      description,
      location,
      images,
      createdAt: now,
    }

    /* SAVE INCIDENT REPORT */
    const existingReports = JSON.parse(
      localStorage.getItem("incident_reports") || "[]"
    )

    localStorage.setItem(
      "incident_reports",
      JSON.stringify([report, ...existingReports])
    )

    /* CREATE NEWSFEED POST */
    const newsPost = {
      id: now,
      author: "Resident",
      time: "Just now",
      postType: "EVENT",
      incidentType: incidentType,
      location: location || undefined,
      content: description,
      image: images[0] || undefined,
      interested: false,
      saved: false,
      comments: [], // keep compatible with comment system
    }

    const existingNews = JSON.parse(
      localStorage.getItem("newsfeed") || "[]"
    )

    localStorage.setItem(
      "newsfeed",
      JSON.stringify([newsPost, ...existingNews])
    )

    /* RESET FORM */
    setDescription("")
    setLocation("")
    setImages([])

    router.push("/dashboards/residents/news-feed")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start px-4 py-10">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 mt-6">
        <h2 className="text-xl font-semibold mb-6">
          Report an Environmental Incident
        </h2>

        {/* INCIDENT TYPE (NOT CLICKABLE) */}
        <div className="flex gap-6 mb-6">
          <div className="flex-1 p-6 rounded-xl border bg-red-100 border-red-400">
            <Flame className="mx-auto text-red-600" />
            <p className="text-center mt-2 font-medium">Fire</p>
          </div>

          <div className="flex-1 p-6 rounded-xl border bg-blue-100 border-blue-400">
            <Waves className="mx-auto text-blue-600" />
            <p className="text-center mt-2 font-medium">Flood</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* DESCRIPTION */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-28 border rounded-xl p-4 mb-4"
            placeholder="Describe the incident"
            required
          />

          {/* LOCATION */}
          <div className="flex gap-2 mb-4 relative">
            <div className="relative flex-1 z-[1000]">
              <input
                value={location}
                onChange={(e) => autoSearchWhileTyping(e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="Barangay, street, city"
              />

              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 bg-white border rounded-xl shadow-lg w-full max-h-48 overflow-auto">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setLocation(s.display_name)
                        setMapCenter([
                          parseFloat(s.lat),
                          parseFloat(s.lon),
                        ])
                        setSuggestions([])
                      }}
                    >
                      📍 {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

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

          {/* MAP */}
          <div className={`${capturing ? "hidden" : "block"} mb-6`}>
            <IncidentMap mapCenter={mapCenter} setLocation={setLocation} />
          </div>

          {/* PHOTO AREA */}
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
                Click to take photo of the fire
              </>
            )}
          </div>

          {/* CAMERA */}
          {capturing && (
            <Camera
              videoRef={videoRef}
              capturePhoto={capturePhoto}
              cancelCapture={cancelCapture}
            />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* SUBMIT */}
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
