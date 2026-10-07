"use client";

import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import L from "leaflet";

// divIcon avoids all the webpack/Next.js image-import issues with Leaflet's
// default PNG markers — no image files needed, rendered purely from CSS.
const pinIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;background:#4f46e5;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface SinglePinMapProps {
  lat: number;
  lng: number;
  className?: string;
  showRadius?: boolean;
  showPin?: boolean;
}

export function SinglePinMap({ lat, lng, className = "h-full w-full", showRadius = true, showPin = true }: SinglePinMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      className={className}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {showRadius && (
        <Circle
          center={[lat, lng]}
          radius={600}
          pathOptions={{ color: "#4f46e5", fillColor: "#4f46e5", fillOpacity: 0.12, weight: 1.5 }}
        />
      )}
      {showPin && <Marker position={[lat, lng]} icon={pinIcon} />}
    </MapContainer>
  );
}
