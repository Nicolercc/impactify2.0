"use client";

import { useEffect, useState } from "react";

export type UserLocationState = {
  /** Human-readable place line without leading emoji, e.g. "Inwood, Manhattan" */
  label: string | null;
  loading: boolean;
  error: boolean;
};

type NominatimAddress = Record<string, string | undefined>;

function buildLocationLabel(addr: NominatimAddress): string | null {
  const neighbourhood =
    addr.neighbourhood ||
    addr.suburb ||
    addr.quarter ||
    addr.hamlet ||
    addr.city_district;
  const boroughOrCity =
    addr.borough || addr.city || addr.town || addr.village || addr.municipality || addr.county;

  if (neighbourhood && boroughOrCity) return `${neighbourhood}, ${boroughOrCity}`;
  if (boroughOrCity) return boroughOrCity;
  if (neighbourhood) return neighbourhood;
  return null;
}

export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({
    label: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({ label: null, loading: false, error: true });
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

        try {
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

          const res = await fetch(url, {
            method: "GET",
            mode: "cors",
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });

          window.clearTimeout(timeoutId);

          if (!res.ok) throw new Error("reverse geocode failed");

          const data = (await res.json()) as {
            address?: NominatimAddress;
            display_name?: string;
          };

          const addr = data.address ?? {};
          let label = buildLocationLabel(addr);

          if (!label && typeof data.display_name === "string") {
            const bits = data.display_name
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            label = bits.slice(0, 2).join(", ") || bits[0] || null;
          }

          if (cancelled) return;

          if (label) {
            setState({ label, loading: false, error: false });
          } else {
            setState({ label: null, loading: false, error: true });
          }
        } catch {
          if (!cancelled) setState({ label: null, loading: false, error: true });
        }
      },
      () => {
        if (!cancelled) setState({ label: null, loading: false, error: true });
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 12_000,
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
