'use client'

import { useState, useRef } from 'react'
import Camera from './Camera'
import { MapPin, Upload, Send, Flame, Waves } from 'lucide-react'

export default function IncidentForm() {
  const [description, setDescription] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [images, setImages] = useState<string[]>([])
  const [capturing, setCapturing] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const startCamera = async (): Promise<void> => {
    setCapturing(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    } catch (err: unknown) {
      if (err instanceof Error) alert('Unable to access camera: ' + err.message)
      setCapturing(false)
    }
  }

  const capturePhoto = (): void => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !video.srcObject || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/png')
    setImages((prev) => [...prev, dataUrl])

    const tracks = (video.srcObject as MediaStream).getTracks()
    tracks.forEach((track) => track.stop())
    video.srcObject = null
    setCapturing(false)
  }

  const cancelCapture = (): void => {
    const tracks =
      (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || []
    tracks.forEach((track) => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCapturing(false)
  }

  const handleGetLocation = (): void => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`)
      },
      () => alert('Unable to retrieve location')
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const report = {
      description,
      location,
      images,
      createdAt: new Date().toISOString(),
    }
    console.log(report)
    alert('Report submitted!')
    setDescription('')
    setLocation('')
    setImages([])
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl">
        <div className="px-8 pt-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Report an Environmental Incident
          </h2>
        </div>

        <div className="px-8 py-6">
        {/* Fire / Flood */}
        <div className="flex gap-6 mb-8">
          {/* Fire */}
          <div className="flex-1">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-lg font-semibold text-red-700 mb-4 flex flex-col items-center justify-center gap-2">
                <Flame className="w-12 h-12 text-red-500" />
                Fire
              </p>
            </div>
          </div>

          {/* Flood */}
          <div className="flex-1">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-lg font-semibold text-blue-700 mb-4 flex flex-col items-center justify-center gap-2">
                <Waves className="w-12 h-12 text-blue-500" />
                Flood
              </p>
            </div>
          </div>
        </div>
          <form onSubmit={handleSubmit}>
            {/* Description */}
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">
                Incident Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-28 border rounded-xl px-4 py-3 text-sm"
                required
              />
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter address or use GPS"
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                  required
                />

                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="flex items-center justify-center px-4 rounded-xl border bg-gray-500 text-white"
                >
                  <MapPin className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Camera */}
            <div className="mb-8">
              <label className="block font-medium text-gray-700 mb-2">
                Upload Images
              </label>

              <div
                className="border-2 border-dashed rounded-2xl p-6 text-center bg-gray-50 cursor-pointer"
                onClick={() => !capturing && startCamera()}
              >
                {images.length > 0 && !capturing ? (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        className="rounded-xl max-h-48 w-full object-cover"
                      />
                    ))}
                  </div>
                ) : !capturing ? (
                  <>
                    <Upload className="mx-auto w-12 h-12 mb-2 text-gray-500" />
                    Click to take photo
                  </>
                ) : null}
              </div>

              {capturing && (
                <Camera
                  videoRef={videoRef}
                  capturePhoto={capturePhoto}
                  cancelCapture={cancelCapture}
                />
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-green-800"
            >
              <Send className="w-6 h-6" />
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
