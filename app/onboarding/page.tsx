"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/auth";
import { onboardingCauseChips } from "@/lib/constants/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const BIO_MAX = 280;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const bioRemaining = useMemo(() => BIO_MAX - bio.length, [bio.length]);

  function toggleCause(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFinish() {
    setFormError(null);
    startTransition(async () => {
      const { error } = await updateProfile({
        interests: Array.from(selected),
        bio: bio.trim() || null,
        location_city: city.trim() || null,
        location_state: stateVal.trim() || null,
      });
      if (error) {
        setFormError(error.message);
        return;
      }
      router.push("/feed");
      router.refresh();
    });
  }

  return (
    <div id="main-content" className="min-h-screen bg-parchment px-4 pb-24 pt-28 font-sans text-ink">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-10 flex justify-center gap-2" aria-label="Onboarding progress">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              step === 1 ? "bg-plum-700" : "bg-plum-100",
            )}
            aria-current={step === 1 ? "step" : undefined}
          />
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              step === 2 ? "bg-plum-700" : "bg-plum-100",
            )}
            aria-current={step === 2 ? "step" : undefined}
          />
        </div>

        {step === 1 ? (
          <>
            <h1 className="font-serif text-2xl font-medium text-plum-700 sm:text-3xl">
              What causes do you care about?
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Pick one or more. You can change this anytime in your profile.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {onboardingCauseChips.map(({ id, label, icon: Icon }) => {
                const isOn = selected.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleCause(id)}
                    className={cn(
                      "flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
                      isOn
                        ? "border-plum-700 bg-plum-700 text-parchment"
                        : "border-plum-100 bg-transparent text-ink hover:bg-plum-50",
                    )}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push("/feed")}
                className="text-sm text-ink-muted underline decoration-ink-muted underline-offset-4 hover:text-plum-700"
              >
                Skip for now
              </button>
              <Button
                type="button"
                disabled={selected.size === 0}
                onClick={() => setStep(2)}
                className="h-11 bg-chartreuse-500 font-medium text-ink hover:bg-chartreuse-700 sm:min-w-[140px]"
              >
                Next →
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-medium text-plum-700 sm:text-3xl">
              Add a profile photo and bio
            </h1>
            <p className="mt-2 text-sm text-ink-muted">All fields are optional.</p>

            <div className="mt-8">
              <Label className="text-sm font-medium text-ink">Profile photo</Label>
              <div
                className="mt-2 flex size-24 items-center justify-center rounded-full border-2 border-dashed border-plum-100 bg-plum-50/50 text-ink-muted"
                aria-disabled
              >
                <Camera className="size-8" aria-hidden />
              </div>
              <p className="mt-2 text-xs text-ink-muted">Coming soon</p>
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="onboarding-bio" className="text-sm font-medium text-ink">
                  Bio
                </Label>
                <span className="text-xs tabular-nums text-ink-muted" aria-live="polite">
                  {bioRemaining} left
                </span>
              </div>
              <Textarea
                id="onboarding-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                rows={4}
                maxLength={BIO_MAX}
                disabled={isPending}
                className="min-h-[120px] resize-y"
                aria-describedby="onboarding-bio-hint"
              />
              <p id="onboarding-bio-hint" className="text-xs text-ink-muted">
                Up to {BIO_MAX} characters.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="onboarding-city" className="text-sm font-medium text-ink">
                  City
                </Label>
                <Input
                  id="onboarding-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isPending}
                  className="h-11"
                  autoComplete="address-level2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboarding-state" className="text-sm font-medium text-ink">
                  State
                </Label>
                <Input
                  id="onboarding-state"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  disabled={isPending}
                  className="h-11"
                  autoComplete="address-level1"
                />
              </div>
            </div>

            <p
              className="mt-6 min-h-[1.25rem] text-sm text-red-600"
              role={formError ? "alert" : undefined}
            >
              {formError ?? ""}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-ink-muted hover:text-plum-700"
                disabled={isPending}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleFinish}
                disabled={isPending}
                className="h-11 bg-chartreuse-500 font-medium text-ink hover:bg-chartreuse-700 sm:min-w-[180px]"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Finish setup →
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
