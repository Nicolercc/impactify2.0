"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "impactify-theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
    applyThemeClass(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  useEffect(() => {
    // On mount: localStorage override wins, else default to light.
    // We intentionally do NOT default to system preference so production
    // renders light-first consistently (marketing defaults).
    let initial: Theme = "light";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") initial = stored;
    } catch {
      // ignore
    }
    setThemeState(initial);
    applyThemeClass(initial);

    // If user hasn't explicitly chosen a theme, we still follow system changes
    // only after first paint in dev; in production we keep the default stable.
    let hasOverride = false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      hasOverride = stored === "dark" || stored === "light";
    } catch {
      // ignore
    }

    if (hasOverride) return;
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const onChange = () => {
      const next = mql.matches ? "dark" : "light";
      setThemeState(next);
      applyThemeClass(next);
    };

    if ("addEventListener" in mql) mql.addEventListener("change", onChange);
    // @ts-expect-error older Safari
    else mql.addListener(onChange);

    return () => {
      if ("removeEventListener" in mql) mql.removeEventListener("change", onChange);
      // @ts-expect-error older Safari
      else mql.removeListener(onChange);
    };
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggle, setTheme }),
    [theme, toggle, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

