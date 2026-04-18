"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "clarity-location";
const EVENT_NAME = "clarity-location-updated";

export type LocationStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unsupported"
  | "error";

export type LocationData = {
  status: LocationStatus;
  coords?: { lat: number; lng: number };
  label?: string;
  place?: string;
  neighborhood?: string;
  city?: string;
  region?: string;
  country?: string;
  timeZone?: string;
  capturedAt?: number;
  errorMessage?: string;
};

const DEFAULT: LocationData = { status: "idle" };

export function readLocationSnapshot(): LocationData {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as LocationData;
    return parsed?.status ? parsed : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function writeSnapshot(data: LocationData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // localStorage can throw in private-mode iOS — safe to ignore
  }
}

export function useLocation() {
  const [data, setData] = useState<LocationData>(DEFAULT);

  useEffect(() => {
    setData(readLocationSnapshot());
    const handler = () => setData(readLocationSnapshot());
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const next: LocationData = { status: "unsupported" };
      setData(next);
      writeSnapshot(next);
      return;
    }

    setData({ status: "prompting" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let reverse: {
          label?: string;
          place?: string;
          neighborhood?: string;
          city?: string;
          region?: string;
          country?: string;
        } = {};
        try {
          const r = await fetch(
            `/api/location/reverse?lat=${lat}&lng=${lng}`,
          );
          if (r.ok) reverse = await r.json();
        } catch {
          // reverse geocode is a nice-to-have; fall through with coords only
        }
        const next: LocationData = {
          status: "granted",
          coords: { lat, lng },
          timeZone,
          capturedAt: Date.now(),
          ...reverse,
        };
        setData(next);
        writeSnapshot(next);
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        const next: LocationData = denied
          ? { status: "denied" }
          : { status: "error", errorMessage: err.message };
        setData(next);
        writeSnapshot(next);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  const clear = useCallback(() => {
    const next: LocationData = { status: "idle" };
    setData(next);
    writeSnapshot(next);
  }, []);

  return { data, request, clear };
}
