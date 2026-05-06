"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareLinkButton({ url, label = "Share" }: { url: string; label?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-plum-100 text-ink hover:bg-plum-50"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied!");
        } catch {
          toast.error("Could not copy link.");
        }
      }}
    >
      <Share2 className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
