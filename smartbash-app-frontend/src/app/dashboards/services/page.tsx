"use client";


import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Incident } from "../../../components/core-ui/services-components/ServicesMap";
import { apiFetch } from "@/lib/api";
import { clearAuthTokens } from "@/lib/auth.client";


const ServicesMap = dynamic(
  () => import("../../../components/core-ui/services-components/ServicesMap"),
  { ssr: false }
);


export default function ServicesMapPage() {
  const [myLocation, setMyLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [targetIncident, setTargetIncident] = useState<Incident | null>(null);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [myAddress, setMyAddress] = useState("Detecting...");
  const [targetAddress, setTargetAddress] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);


  // Profile info
  const [profileImage, setProfileImage] = useState("https://ui-avatars.com/api/?name=Rescue+Team&background=DC2626&color=FFFFFF&size=128");
  const [teamName, setTeamName] = useState("Emergency Responder");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [currentDispatchId, setCurrentDispatchId] = useState<number | null>(null);


  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const res = await apiFetch("/auth/services/profile/", { method: "GET" });
        const data = await res.json();
        if (res.ok) {
          const profile = data?.profile || {};
          setProfileImage(
            profile.avatarUrl ||
              "https://ui-avatars.com/api/?name=Rescue+Team&background=DC2626&color=FFFFFF&size=128"
          );
          setTeamName(profile.teamName || "Emergency Responder");
        }
      } catch {
        // keep defaults
      } finally {
        setProfileLoaded(true);
      }
    };
    loadProfileData();
    window.addEventListener("profileUpdated", loadProfileData);
    return () => window.removeEventListener("profileUpdated", loadProfileData);
  }, []);


  // Reverse geocoding
  const getAddress = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`
      );
      const data = await res.json();
      return data.display_name?.split(",").slice(0, 3).join(",") || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };


  // Distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };


  // GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("GPS not supported");
      setLoading(false);
      return;
    }


    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setMyLocation(loc);
        setMyAddress(await getAddress(loc.lat, loc.lon));
        setIsTracking(true);
        setLoading(false);
        setLocationError(null);
      },
      (err) => {
        let msg = "Unable to get location";
        if (err.code === 1) msg = "Location permission denied";
        else if (err.code === 2) msg = "Location unavailable";
        else if (err.code === 3) msg = "Location timeout";
        setLocationError(msg);
        setLoading(false);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
    setWatchId(id);
  };


  // Start tracking on mount
  useEffect(() => {
    startTracking();
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);


  useEffect(() => {
    const loadIncidents = async () => {
      const res = await apiFetch("/auth/services/dispatches/", { method: "GET" });
      const data = await res.json();
      if (!res.ok) {
        setAllIncidents([]);
        setTargetIncident(null);
        return;
      }
      const dispatches = data?.dispatches || [];
      const incidents: Incident[] = dispatches.map((d: any) => ({
        id: Number(d.reportId || d.id),
        lat: Number(d.lat ?? 10.3157),
        lon: Number(d.lng ?? 123.8854),
        location: d.location || d.barangay || "Unknown",
        type: (String(d.incidentType || "Fire").toLowerCase() === "flood" ? "flood" : "fire") as "fire" | "flood",
        urgency: String(d.status || "Dispatched").toLowerCase() === "completed" ? "low" : "high",
        reports: [d],
        status: String(d.status || "Dispatched").toLowerCase() === "completed" ? "completed" : "inprogress",
      }));
      setAllIncidents(incidents);
      const active = incidents.filter(i => i.status === "waiting" || i.status === "inprogress");
      const target = active.length > 0 ? active[active.length - 1] : incidents[incidents.length - 1];
      setTargetIncident(target);
      if (target) {
        const matchedDispatch = dispatches.find((d: any) => Number(d.reportId || d.id) === target.id);
        setCurrentDispatchId(matchedDispatch?.id || null);
        setTargetAddress(target.location || (await getAddress(target.lat, target.lon)));
      } else {
        setCurrentDispatchId(null);
      }
    };


    loadIncidents();
    const interval = setInterval(loadIncidents, 5000);
    return () => clearInterval(interval);
  }, []);


  // Update distance
  useEffect(() => {
    if (myLocation && targetIncident) {
      setDistance(calculateDistance(myLocation.lat, myLocation.lon, targetIncident.lat, targetIncident.lon));
    }
  }, [myLocation, targetIncident]);


  // Open Google Maps
  const openInGoogleMaps = () => {
    if (myLocation && targetIncident) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${myLocation.lat},${myLocation.lon}&destination=${targetIncident.lat},${targetIncident.lon}&travelmode=driving`,
        "_blank"
      );
    }
  };


  // Mark incident as completed
  const markAsArrived = () => {
    if (!currentDispatchId) return;
    const complete = async () => {
      try {
        const res = await apiFetch("/auth/services/dispatches/complete/", {
          method: "POST",
          body: JSON.stringify({ dispatchId: currentDispatchId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to complete dispatch");
        window.location.reload();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to complete dispatch";
        window.alert(message);
      }
    };
    complete();
  };


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      {profileLoaded && (
        <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboards/services/profile" className="bg-red-800 hover:bg-red-900 p-2 rounded-lg transition">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{teamName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isTracking && (
                <span className="bg-green-500 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Live
                </span>
              )}
              <button onClick={() => { apiFetch("/auth/logout/", { method: "POST" }).catch(() => {}); clearAuthTokens(); window.location.href = "/login"; }} className="bg-red-900 hover:bg-red-950 px-4 py-2 rounded-lg text-sm transition">
                Logout
              </button>
            </div>
          </div>
        </header>
      )}


      {/* Loading / Error */}
      {loading && !locationError && (
        <div className="bg-blue-50 border-l-4 border-blue-500 px-6 py-3 flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-900 text-sm font-medium">Acquiring GPS location...</span>
        </div>
      )}


      {locationError && (
        <div className="bg-red-50 border-l-4 border-red-500 px-6 py-3 flex justify-between items-center">
          <span className="text-red-900 text-sm font-medium">{locationError}</span>
          <button onClick={() => { setLoading(true); setLocationError(null); startTracking(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">
            Retry
          </button>
        </div>
      )}


      {/* Active Route */}
      {myLocation && targetIncident && (
        <div className="bg-white shadow-md border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Active Route</h2>
            {distance !== null && (
              <p className="text-2xl font-bold text-blue-600">
                {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(2)} km`}
              </p>
            )}
          </div>


          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {/* FROM */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex gap-3">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">A</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-blue-900 uppercase mb-1">Your Location</p>
                <p className="text-sm font-medium text-gray-900 break-words">{myAddress}</p>
              </div>
            </div>


            {/* TO */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex gap-3">
              <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">B</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-red-900 uppercase mb-1">Incident Location</p>
                <p className="text-sm font-medium text-gray-900 break-words">{targetAddress}</p>
                <p className="text-xs font-bold text-red-700 mt-1">{targetIncident.type.toUpperCase()} - {targetIncident.urgency.toUpperCase()}</p>
              </div>
            </div>
          </div>


          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-xs text-gray-500">
              {distance !== null && distance >= 0.1 && `ETA: ${Math.ceil((distance / 40) * 60)} min`}
              {distance !== null && distance < 0.1 && <span className="text-green-600 font-semibold">✓ Arrived</span>}
            </span>
            <div className="flex gap-2">
              {distance !== null && distance < 0.1 && (
                <button onClick={markAsArrived} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  Mark Completed
                </button>
              )}
              <button onClick={openInGoogleMaps} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Navigate
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        {!myLocation && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-400">Waiting for GPS signal...</p>
          </div>
        )}
        {myLocation && <ServicesMap incidents={allIncidents} userLocation={myLocation} targetIncident={targetIncident} />}
      </div>


      {/* Footer */}
      {allIncidents.length > 0 && (
        <footer className="bg-white border-t px-6 py-2 text-sm text-gray-600">
          <span className="font-semibold">{allIncidents.length}</span> incident(s) in queue
        </footer>
      )}
    </div>
  );
}


