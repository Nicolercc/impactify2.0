"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { flagArticle } from "@/app/actions/articles";
import type { FlagArticleInput } from "@/lib/schemas/articles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const FLAG_OPTIONS: { value: FlagArticleInput["flagType"]; label: string }[] = [
  { value: "factual_error", label: "Factual error" },
  { value: "missing_context", label: "Missing context" },
  { value: "bias", label: "Bias" },
  { value: "other", label: "Other" },
];

export function FlagDialog({
  articleId,
  isSignedIn,
  redirectPath,
}: {
  articleId: string;
  isSignedIn: boolean;
  redirectPath: string;
}) {
  const [open, setOpen] = useState(false);
  const [flagType, setFlagType] = useState<FlagArticleInput["flagType"]>("factual_error");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit() {
    startTransition(async () => {
      const res = await flagArticle({
        articleId,
        flagType,
        details: details.trim() || undefined,
      });
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success("Thanks — we received your flag.");
      setOpen(false);
      setDetails("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-2 text-ink-muted hover:text-ink">
          <Flag className="size-4" aria-hidden />
          Flag article
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-plum-700">Flag this article</DialogTitle>
          <DialogDescription>
            Tell us what looks off. Our team reviews flags to keep the briefing trustworthy.
          </DialogDescription>
        </DialogHeader>

        {!isSignedIn ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-ink-muted">Sign in to submit a flag.</p>
            <Button asChild className="w-full">
              <Link href={`/auth/sign-in?redirect=${encodeURIComponent(redirectPath)}`}>Sign in</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Label className="text-ink">What kind of issue is this?</Label>
              <RadioGroup value={flagType} onValueChange={(v: string) => setFlagType(v as FlagArticleInput["flagType"])}>
                {FLAG_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`flag-${opt.value}`} />
                    <Label htmlFor={`flag-${opt.value}`} className="cursor-pointer font-normal text-ink">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag-details">Details (optional)</Label>
              <Textarea
                id="flag-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add context, links, or timestamps if you have them."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={onSubmit} disabled={pending}>
                {pending ? "Submitting…" : "Submit flag"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
