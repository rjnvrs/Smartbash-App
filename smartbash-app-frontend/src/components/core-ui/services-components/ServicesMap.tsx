"use client";


import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


export interface Incident {
  id: number;
  lat: number;
  lon: number;
  location: string;
  type: "fire" | "flood";
  urgency: string;
  reports: any[];
  status?: string;
}


export default function ServicesMap({
  incidents,
  userLocation,
  targetIncident,
}: {
  incidents: Incident[];
  userLocation: { lat: number; lon: number };
  targetIncident: Incident | null;
}) {
  const blueIcon = new L.Icon({
    iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
    iconSize: [32, 32],
  });


  const redIcon = new L.Icon({
    iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
    iconSize: [32, 32],
  });


  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lon]}
      zoom={15}
      className="h-full w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />


      {/* You */}
      <Marker position={[userLocation.lat, userLocation.lon]} icon={blueIcon}>
        <Popup>You are here</Popup>
      </Marker>


      {/* Target */}
      {targetIncident && (
        <>
          <Marker
            position={[targetIncident.lat, targetIncident.lon]}
            icon={redIcon}
          >
            <Popup>Incident</Popup>
          </Marker>


          <Polyline
            positions={[
              [userLocation.lat, userLocation.lon],
              [targetIncident.lat, targetIncident.lon],
            ]}
            color="blue"
          />
        </>
      )}


      {/* Other incidents */}
      {incidents
        .filter((i) => i.id !== targetIncident?.id)
        .map((inc) => (
          <Marker key={inc.id} position={[inc.lat, inc.lon]} icon={redIcon}>
            <Popup>{inc.location}</Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
