'use client'

import { useState } from 'react'

export default function IncidentForm() {
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // 📷 IMAGE UPLOAD
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // 📍 GET CURRENT LOCATION
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation(`Lat: ${latitude}, Lng: ${longitude}`)
      },
      () => {
        alert('Unable to retrieve your location')
      }
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const reportData = {
      description,
      location,
      image,
      createdAt: new Date().toISOString(),
    }

    console.log('📦 Report Data:', reportData)
    alert('Report submitted!')

    setDescription('')
    setLocation('')
    setImage(null)
    setImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl">

        {/* Title */}
        <div className="px-8 pt-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Report an Environmental Incident
          </h2>
        </div>

        <div className="px-8 py-6">

          {/* Fire / Flood options */}
          <div className="flex gap-6 mb-8">
            <div className="flex-1 cursor-pointer">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-red-700 mb-2">Fire</p>
                <img src="/RecentReport_icons/Fire_icons.png" className="mx-auto w-12 h-12" />
              </div>
            </div>

            <div className="flex-1 cursor-pointer">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-blue-700 mb-2">Flood</p>
                <img src="/RecentReport_icons/Flood_icons.png" className="mx-auto w-12 h-12" />
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
                  className="px-4 rounded-xl border bg-gray-500"
                >
                  <img src="/RecentReport_icons/Map_icons.png" className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <label className="block font-medium text-gray-700 mb-2">
                Upload Image
              </label>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />

                <div className="border-2 border-dashed rounded-2xl p-6 text-center bg-gray-50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto max-h-48 rounded-xl"
                    />
                  ) : (
                    <>
                      <img src="/RecentReport_icons/Upload.png" className="mx-auto w-12 h-12 mb-2" />
                      Click to upload image
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-green-800"
            >
              <img src="/RecentReport_icons/Send_icon.png" className="w-7 h-7" />
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
