"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Upload, Send, Flame, Waves } from "lucide-react";
import Camera from "./Camera";
import { apiFetch } from "@/lib/api";

const IncidentMap = dynamic(() => import("./IncidentMap"), { ssr: false });

type IncidentType = "Fire" | "Flood";
type SearchSuggestion = { display_name: string; lat: string; lon: string };

export default function IncidentForm() {
  const router = useRouter();

  const [incidentType, setIncidentType] = useState<IncidentType>("Fire");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]);
  const [images, setImages] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    setCameraError("");
    const insecureContext =
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1";
    if (insecureContext) {
      setCameraError("Camera needs HTTPS (or localhost). Use Upload Image instead.");
      fileInputRef.current?.click();
      return;
    }

    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Camera access denied";
      setCameraError(`${message}. You can still upload an image file.`);
      fileInputRef.current?.click();
      setCapturing(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    setImages((prev) => [...prev, canvas.toDataURL("image/png")]);

    (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
    video.srcObject = null;
    setCapturing(false);
  };

  const cancelCapture = () => {
    (videoRef.current?.srcObject as MediaStream | null)
      ?.getTracks()
      ?.forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCapturing(false);
  };

  const autoSearchWhileTyping = async (value: string) => {
    setLocation(value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    typingTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
            value
          )}`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const tasks = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        })
    );
    Promise.all(tasks)
      .then((encoded) => {
        setImages((prev) => [...prev, ...encoded.filter(Boolean)]);
      })
      .catch(() => {
        setCameraError("Image upload failed.");
      });
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/auth/residents/incidents/create/", {
        method: "POST",
        body: JSON.stringify({
          type: incidentType.toLowerCase(),
          description,
          location,
          lat: mapCenter[0],
          lng: mapCenter[1],
          images,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Failed to submit report");

      setDescription("");
      setLocation("");
      setImages([]);
      setIncidentType("Fire");
      router.push("/dashboards/residents/reports");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit report";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {cameraError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {cameraError}
            </div>
          )}

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
                      key={i}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setLocation(s.display_name);
                        setMapCenter([parseFloat(s.lat), parseFloat(s.lon)]);
                        setSuggestions([]);
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
            onClick={() => !capturing && startCamera()}
            className="border-2 border-dashed rounded-xl p-6 text-center mb-6 cursor-pointer"
          >
            {images.length ? (
              images.map((img, i) => (
                <img key={i} src={img} className="rounded-xl mb-2" alt={`incident-${i}`} />
              ))
            ) : (
              <>
                <Upload className="mx-auto mb-2" />
                Click to take photo of the {incidentType.toLowerCase()}
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {capturing && (
            <Camera videoRef={videoRef} capturePhoto={capturePhoto} cancelCapture={cancelCapture} />
          )}

          <canvas ref={canvasRef} className="hidden" />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 rounded-xl disabled:opacity-60"
          >
            <Send className="inline mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
