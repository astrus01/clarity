"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import type { MapMarker, MapCenter } from "./map-panel";

// Dark-friendly CARTO tiles — free under CC-BY, no API key.
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function numberedIcon(n: number, tone: "primary" | "user" = "primary") {
  const isUser = tone === "user";
  const fill = isUser ? "oklch(0.70 0.08 160)" : "oklch(0.75 0.07 75)";
  const text = "oklch(0.12 0.01 255)";
  const body = isUser
    ? `<span style="font-size:10px;font-weight:600;letter-spacing:0.02em">YOU</span>`
    : `<span style="font-size:13px;font-weight:700">${n}</span>`;
  const html = `
    <div style="
      width:28px;height:28px;border-radius:999px;
      background:${fill};color:${text};
      display:flex;align-items:center;justify-content:center;
      font-family:'JetBrains Mono',ui-monospace,monospace;
      box-shadow:0 2px 6px rgba(0,0,0,0.35), 0 0 0 2px oklch(0.12 0.01 255);
    ">${body}</div>`;
  return L.divIcon({
    html,
    className: "clarity-map-pin",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function buildPopup(m: MapMarker): string {
  const title = escapeHtml(m.label);
  const desc = m.description ? escapeHtml(m.description) : "";
  const link = m.url
    ? `<a href="${escapeAttr(m.url)}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:6px;color:oklch(0.75 0.07 75);text-decoration:underline;text-underline-offset:2px">Open ↗</a>`
    : "";
  return `
    <div style="font-family:'Manrope',sans-serif;font-size:0.85rem;line-height:1.35">
      <div style="font-weight:600;color:oklch(0.92 0.01 255)">${title}</div>
      ${desc ? `<div style="color:oklch(0.65 0.01 255);margin-top:2px">${desc}</div>` : ""}
      ${link}
    </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

export function MapView({
  center,
  markers,
  userLocation,
}: {
  center?: MapCenter;
  markers: MapMarker[];
  userLocation?: { lat: number; lng: number };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Stable signature so the effect only reinitializes when the DATA actually
  // changes — not on every parent render. Without this, fresh array/object
  // references from props cause teardown+rebuild every render and Leaflet
  // occasionally loses a layer mid-dispose ("_leaflet_pos of undefined").
  const signature = useMemo(
    () =>
      JSON.stringify({
        c: center ? [center.lat, center.lng, center.zoom ?? null] : null,
        m: markers.map((m) => [m.lat, m.lng, m.label, m.description ?? ""]),
        u: userLocation ? [userLocation.lat, userLocation.lng] : null,
      }),
    [center, markers, userLocation],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If the node was previously initialized by Leaflet (Strict-Mode
    // double-mount / fast-refresh), scrub the marker before re-initializing.
    const tagged = el as HTMLDivElement & { _leaflet_id?: number };
    if (tagged._leaflet_id !== undefined) {
      delete tagged._leaflet_id;
    }

    const fallbackCenter: [number, number] = center
      ? [center.lat, center.lng]
      : userLocation
        ? [userLocation.lat, userLocation.lng]
        : markers[0]
          ? [markers[0].lat, markers[0].lng]
          : [33.7756, -84.3963];

    const map = L.map(el, {
      center: fallbackCenter,
      zoom: center?.zoom ?? 14,
      scrollWheelZoom: false,
      attributionControl: false,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    const points: L.LatLngTuple[] = [];

    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], {
        icon: numberedIcon(0, "user"),
      })
        .addTo(map)
        .bindPopup("Your location");
      points.push([userLocation.lat, userLocation.lng]);
    }

    markers.forEach((mk, i) => {
      L.marker([mk.lat, mk.lng], { icon: numberedIcon(i + 1) })
        .addTo(map)
        .bindPopup(buildPopup(mk));
      points.push([mk.lat, mk.lng]);
    });

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points.map(([a, b]) => L.latLng(a, b)));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (points.length === 1) {
      map.setView(points[0], center?.zoom ?? 15);
    }

    // Kick Leaflet to recalculate size once the DOM settles — avoids a
    // grey-tile box when the panel animates in. Guard against the map
    // having been disposed before the frame fires.
    let disposed = false;
    const raf = requestAnimationFrame(() => {
      if (disposed || mapRef.current !== map) return;
      try {
        map.invalidateSize();
      } catch {
        // Layer pane may have been torn down mid-frame — ignore.
      }
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      mapRef.current = null;
      try {
        map.remove();
      } catch {
        // Swallow teardown races — the container is being discarded anyway.
      }
      const tagged2 = el as HTMLDivElement & { _leaflet_id?: number };
      if (tagged2._leaflet_id !== undefined) {
        delete tagged2._leaflet_id;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return (
    <div
      ref={containerRef}
      className="relative h-[360px] w-full overflow-hidden rounded-md border border-border"
      style={{ background: "oklch(0.14 0.01 255)" }}
    />
  );
}
