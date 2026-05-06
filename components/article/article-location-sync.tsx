"use client";

import { useEffect } from "react";

const LS_STATE = "impactify:state";
const LS_DISTRICT = "impactify:district";

/**
 * Optional URL overrides for rep widgets (`?state=NY&district=72`).
 */
export function ArticleLocationSync(props: { state: string | null; district: string | null }) {
  const { state, district } = props;

  useEffect(() => {
    if (state && state.length === 2) {
      try {
        window.localStorage.setItem(LS_STATE, state.toUpperCase());
      } catch {
        /* ignore quota / private mode */
      }
    }
    if (district != null && district.trim()) {
      try {
        window.localStorage.setItem(LS_DISTRICT, district.trim());
      } catch {
        /* ignore */
      }
    }
  }, [state, district]);

  return null;
}
