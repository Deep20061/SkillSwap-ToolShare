"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import type { MapPin } from "@/features/listings/hooks/useMapPins";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Clustering ───────────────────────────────────────────────────────────────

interface ClusterPoint {
  id: string;
  lat: number;
  lng: number;
  pin: MapPin;
}

interface Cluster {
  lat: number;
  lng: number;
  count: number;
  pins: MapPin[];
}

function clusterPoints(points: ClusterPoint[], zoom: number): Cluster[] {
  const gridDeg = 40 / Math.pow(2, zoom);
  const cells = new Map<string, ClusterPoint[]>();
  for (const pt of points) {
    const key = `${Math.floor(pt.lat / gridDeg)}:${Math.floor(pt.lng / gridDeg)}`;
    const arr = cells.get(key) ?? [];
    arr.push(pt);
    cells.set(key, arr);
  }
  return Array.from(cells.values()).map((group) => ({
    lat: group.reduce((s, p) => s + p.lat, 0) / group.length,
    lng: group.reduce((s, p) => s + p.lng, 0) / group.length,
    count: group.length,
    pins: group.map((g) => g.pin),
  }));
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function makeClusterIcon(count: number) {
  const size = count > 99 ? 52 : count > 9 ? 44 : 36;
  const fs = count > 99 ? 11 : count > 9 ? 12 : 13;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:rgba(15,23,42,0.88);backdrop-filter:blur(6px);border:2px solid rgba(255,255,255,0.2);border-radius:50%;box-shadow:0 4px 16px rgba(0,0,0,0.35),0 0 0 4px rgba(15,23,42,0.12);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${fs}px;font-family:ui-monospace,monospace;letter-spacing:-0.02em;">${count}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makePinIcon(type: string) {
  const isSkill = type === "SKILL_OFFER";
  const bg = isSkill ? "#7c3aed" : "#d97706";
  const ring = isSkill ? "rgba(124,58,237,0.3)" : "rgba(217,119,6,0.3)";
  const size = 14;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:2px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.28),0 0 0 3px ${ring};"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Popup HTML ───────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function renderPopup(pin: MapPin): string {
  const isSkill = pin.type === "SKILL_OFFER";
  const accentBg = isSkill ? "#ede9fe" : "#fef3c7";
  const accentColor = isSkill ? "#6d28d9" : "#92400e";
  const accentDot = isSkill ? "#7c3aed" : "#d97706";
  const thumbSrc = pin.thumbnailPath ? esc(`${API_URL}${pin.thumbnailPath}`) : null;
  const city = pin.locationName ? esc(pin.locationName.split(",")[0]!) : null;
  const title = esc(pin.title);

  const thumb = thumbSrc
    ? `<img src="${thumbSrc}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,${accentBg},${accentDot}33);"></div>`;

  return `<a href="/listings/${esc(pin.id)}" style="display:block;width:220px;text-decoration:none;color:inherit;font-family:system-ui,-apple-system,sans-serif;">
    <div style="height:110px;overflow:hidden;border-radius:8px 8px 0 0;background:#f1f5f9;position:relative;">
      ${thumb}
      <span style="position:absolute;top:8px;left:8px;display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;padding:2px 7px;border-radius:4px;background:${accentBg};color:${accentColor};">
        <span style="width:5px;height:5px;border-radius:50%;background:${accentDot};display:inline-block;flex-shrink:0;"></span>
        ${isSkill ? "Skill" : "Tool"}
      </span>
    </div>
    <div style="padding:10px 12px 12px;">
      ${city ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${city}</div>` : ""}
      <div style="font-size:13px;font-weight:600;color:#0f172a;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${title}</div>
      <div style="margin-top:8px;font-size:11px;font-weight:500;color:${accentDot};">View listing →</div>
    </div>
  </a>`;
}

// ─── Marker layer ─────────────────────────────────────────────────────────────

interface BoundsChange {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

function MarkerLayer({
  pins = [],
  onBoundsChange,
  activeId,
  onSelectListing,
}: {
  pins: MapPin[];
  onBoundsChange: (b: BoundsChange) => void;
  activeId?: string | null;
  onSelectListing?: (id: string) => void;
}) {
  const map = useMap();
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const clusterMarkersRef = useRef<L.Marker[]>([]);
  const [zoom, setZoom] = useState(map.getZoom());
  const onSelectListingRef = useRef(onSelectListing);
  onSelectListingRef.current = onSelectListing;

  // Debounce bbox emission — avoids thrashing during zoom animation
  const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onBoundsChangeRef = useRef(onBoundsChange);
  // eslint-disable-next-line react-hooks/refs -- intentional "latest value ref" pattern (epicreact.dev/the-latest-ref-pattern-in-react)
  onBoundsChangeRef.current = onBoundsChange;

  const emitBounds = useCallback((m: L.Map) => {
    if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
    boundsTimerRef.current = setTimeout(() => {
      const b = m.getBounds();
      onBoundsChangeRef.current({
        minLat: b.getSouth(),
        maxLat: b.getNorth(),
        minLng: b.getWest(),
        maxLng: b.getEast(),
      });
    }, 350);
  }, []);

  useMapEvents({
    moveend(e) {
      emitBounds(e.target as L.Map);
    },
    zoomend(e) {
      const m = e.target as L.Map;
      setZoom(m.getZoom());
      emitBounds(m);
    },
  });

  // Emit on first mount
  useEffect(() => {
    emitBounds(map);
    return () => {
      if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild markers only when pins or zoom change — activeId does NOT trigger a rebuild
  useEffect(() => {
    markerMapRef.current.forEach((m) => map.removeLayer(m));
    markerMapRef.current.clear();
    clusterMarkersRef.current.forEach((m) => map.removeLayer(m));
    clusterMarkersRef.current = [];

    const geoPins = (pins ?? []).filter(
      (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
    );

    const points: ClusterPoint[] = geoPins.map((p) => ({
      id: p.id,
      lat: p.latitude,
      lng: p.longitude,
      pin: p,
    }));

    const clusters = clusterPoints(points, zoom);

    for (const cluster of clusters) {
      if (cluster.count === 1) {
        const pin = cluster.pins[0]!;
        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: makePinIcon(pin.type),
        });

        marker.bindPopup(
          L.popup({ maxWidth: 240, closeButton: true, autoPan: true }).setContent(renderPopup(pin))
        );

        marker.on("click", () => {
          onSelectListingRef.current?.(pin.id);
          marker.openPopup();
        });

        marker.addTo(map);
        markerMapRef.current.set(pin.id, marker);
      } else {
        const marker = L.marker([cluster.lat, cluster.lng], {
          icon: makeClusterIcon(cluster.count),
          zIndexOffset: 500,
        });
        marker.on("click", () => {
          map.flyTo([cluster.lat, cluster.lng], Math.min(map.getZoom() + 2, 16), { duration: 0.6 });
        });
        const preview = cluster.pins
          .slice(0, 3)
          .map((p) => `• ${p.title}`)
          .join("\n");
        const more = cluster.count > 3 ? `\n+ ${cluster.count - 3} more` : "";
        marker.bindTooltip(`${cluster.count} listings\n${preview}${more}`, {
          direction: "top",
          offset: [0, -8],
          className: "cluster-tooltip",
        });
        marker.addTo(map);
        clusterMarkersRef.current.push(marker);
      }
    }

    return () => {
      markerMapRef.current.forEach((m) => map.removeLayer(m));
      markerMapRef.current.clear();
      clusterMarkersRef.current.forEach((m) => map.removeLayer(m));
      clusterMarkersRef.current = [];
    };
  }, [pins, zoom, map]);

  // Fly to pin and open popup when activeId changes — no marker rebuild
  useEffect(() => {
    if (!activeId) return;
    const marker = markerMapRef.current.get(activeId);
    if (!marker) return;
    const latlng = marker.getLatLng();
    const targetZoom = Math.max(map.getZoom(), 14);
    map.flyTo(latlng, targetZoom, { duration: 0.5 });
    // Wait for fly animation before opening popup
    const t = setTimeout(() => marker.openPopup(), 550);
    return () => clearTimeout(t);
  }, [activeId, map]);

  return null;
}

// ─── Public component ─────────────────────────────────────────────────────────

interface ListingsMapProps {
  pins: MapPin[];
  onBoundsChange: (bounds: BoundsChange) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
  activeId?: string | null;
  onSelectListing?: (id: string) => void;
}

export function ListingsMap({
  pins,
  onBoundsChange,
  className = "h-full w-full",
  center = [39.5, -8],
  zoom = 7,
  activeId,
  onSelectListing,
}: ListingsMapProps) {
  return (
    <>
      <style>{`
        .cluster-tooltip {
          background: rgba(15,23,42,0.9) !important;
          color: #fff !important;
          border: none !important;
          border-radius: 8px !important;
          font-size: 11px !important;
          font-family: ui-monospace, monospace !important;
          white-space: pre !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
        }
        .cluster-tooltip::before { display: none !important; }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip-container { display: none !important; }
      `}</style>
      <MapContainer center={center} zoom={zoom} className={className} scrollWheelZoom>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <MarkerLayer
          pins={pins}
          onBoundsChange={onBoundsChange}
          activeId={activeId}
          onSelectListing={onSelectListing}
        />
      </MapContainer>
    </>
  );
}
