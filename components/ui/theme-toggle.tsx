"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn("relative transition-colors duration-200", className)}
    >
      <Sun
        className={cn(
          "absolute h-5 w-5 transition-all duration-200",
          dark ? "scale-75 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0",
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 transition-all duration-200",
          dark ? "scale-100 opacity-100 rotate-0" : "scale-75 opacity-0 -rotate-90",
        )}
        aria-hidden
      />
    </Button>
  );
}

