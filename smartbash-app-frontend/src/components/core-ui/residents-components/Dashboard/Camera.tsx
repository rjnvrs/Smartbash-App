"use client"

import { useEffect } from "react"

export interface CameraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  capturePhoto: () => void
  cancelCapture: () => void
}

export default function Camera({
  videoRef,
  capturePhoto,
  cancelCapture,
}: CameraProps) {
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play()
    }
  }, [videoRef])

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />

      <button
        type="button"
        onClick={capturePhoto}
        className="absolute bottom-12 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
      >
        Capture Photo
      </button>

      <button
        type="button"
        onClick={cancelCapture}
        className="absolute top-12 right-6 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
      >
        Cancel
      </button>
    </div>
  )
}
