"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/actions/events";
import { CAUSES, eventCategories } from "@/lib/constants/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

type FieldErrors = Record<string, string | undefined>;

export function CreateEventForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(eventCategories[0]?.id ?? "rally");
  const [selectedCauseIds, setSelectedCauseIds] = useState<Set<string>>(new Set());

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [virtualUrl, setVirtualUrl] = useState("");
  const [capacity, setCapacity] = useState("");

  const [publishMode, setPublishMode] = useState<"draft" | "published">("draft");
  const [coverUrl, setCoverUrl] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const startsRef = useRef<HTMLInputElement>(null);
  const virtualRef = useRef<HTMLInputElement>(null);
  const venueRef = useRef<HTMLInputElement>(null);

  const descRemaining = useMemo(() => 5000 - description.length, [description.length]);

  function toggleCause(id: string) {
    setSelectedCauseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function focusFirst(keys: string[]) {
    const map: Record<string, React.RefObject<HTMLElement | null>> = {
      title: titleRef,
      description: descRef,
      starts_at: startsRef,
      virtual_url: virtualRef,
      venue_name: venueRef,
    };
    for (const k of keys) {
      const r = map[k];
      if (r?.current) {
        r.current.focus();
        break;
      }
    }
  }

  function validateStep(current: Step): FieldErrors {
    const next: FieldErrors = {};
    if (current === 1) {
      if (title.trim().length < 3) next.title = "Title must be at least 3 characters.";
      if (!category) next.category = "Choose a category.";
      if (description.length > 5000) next.description = "Description is too long.";
    }
    if (current === 2) {
      if (!startsAt) next.starts_at = "Start date and time are required.";
      if (isVirtual) {
        if (!virtualUrl.trim()) next.virtual_url = "Virtual events need a meeting URL.";
        else {
          try {
            void new URL(virtualUrl.trim());
          } catch {
            next.virtual_url = "Enter a valid URL.";
          }
        }
      }
    }
    return next;
  }

  function goNext() {
    setFormError(null);
    const v = validateStep(step);
    setErrors(v);
    const keys = Object.keys(v).filter((k) => v[k]);
    if (keys.length) {
      focusFirst(keys);
      return;
    }
    if (step < 3) setStep((s) => (s + 1) as Step);
  }

  function goBack() {
    setErrors({});
    setFormError(null);
    setStep((s) => (Math.max(1, s - 1) as Step));
  }

  function submit() {
    setFormError(null);
    const v = validateStep(1);
    const v2 = validateStep(2);
    const merged = { ...v, ...v2 };
    setErrors(merged);
    const keys = Object.keys(merged).filter((k) => merged[k]);
    if (keys.length) {
      if (v2.starts_at || v2.virtual_url) setStep(2);
      else if (v.title || v.description || v.category) setStep(1);
      focusFirst(keys);
      return;
    }

    const capNum = capacity.trim() ? Number.parseInt(capacity, 10) : null;
    if (capacity.trim() && (!Number.isFinite(capNum) || (capNum ?? 0) <= 0)) {
      setErrors({ capacity: "Enter a positive number or leave blank." });
      setStep(2);
      return;
    }

    startTransition(async () => {
      const startsIso = new Date(startsAt).toISOString();
      const endsIso = endsAt.trim() ? new Date(endsAt).toISOString() : null;

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        starts_at: startsIso,
        ends_at: endsIso,
        timezone: "America/New_York",
        is_virtual: isVirtual,
        virtual_url: isVirtual ? virtualUrl.trim() : null,
        venue_name: !isVirtual ? venueName.trim() || null : null,
        address: !isVirtual ? address.trim() || null : null,
        city: !isVirtual ? city.trim() || null : null,
        state: !isVirtual ? stateVal.trim() || null : null,
        lat: null,
        lng: null,
        cover_image_url: coverUrl.trim() || null,
        category,
        capacity: capNum && capNum > 0 ? capNum : null,
        status: publishMode,
        accepts_donations: false,
        stripe_account_id: null,
        cause_ids: Array.from(selectedCauseIds),
      };

      const res = await createEvent(payload);

      if (res.error || !res.data) {
        setFormError(res.error?.message ?? "Could not create event.");
        return;
      }

      router.push(`/events/${res.data.slug}`);
      router.refresh();
    });
  }

  return (
    <div className="mt-10 space-y-8 font-sans text-ink">
      <div className="flex gap-2" aria-label="Form progress">
        {([1, 2, 3] as const).map((n) => (
          <div
            key={n}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              step >= n ? "bg-chartreuse-500" : "bg-plum-100",
            )}
          />
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-plum-700">Basics</h2>

          <div className="space-y-2">
            <Label htmlFor="ce-title">Title</Label>
            <Input
              ref={titleRef}
              id="ce-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
              aria-invalid={Boolean(errors.title)}
            />
            <p className="min-h-5 text-sm text-red-600" role={errors.title ? "alert" : undefined}>
              {errors.title ?? ""}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between gap-2">
              <Label htmlFor="ce-desc">Description</Label>
              <span className="text-xs tabular-nums text-ink-muted" aria-live="polite">
                {descRemaining} left
              </span>
            </div>
            <Textarea
              ref={descRef}
              id="ce-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 5000))}
              rows={6}
              maxLength={5000}
              aria-invalid={Boolean(errors.description)}
            />
            <p
              className="min-h-5 text-sm text-red-600"
              role={errors.description ? "alert" : undefined}
            >
              {errors.description ?? ""}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 w-full max-w-md">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {eventCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="min-h-5 text-sm text-red-600" role={errors.category ? "alert" : undefined}>
              {errors.category ?? ""}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Cause tags</Label>
            <div className="flex flex-wrap gap-2">
              {CAUSES.map((c) => {
                const on = selectedCauseIds.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCause(c.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500",
                      on
                        ? "border-plum-700 bg-plum-700 text-parchment"
                        : "border-plum-100 bg-transparent text-ink hover:bg-plum-50",
                    )}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-muted">Optional — helps people discover your event.</p>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-plum-700">When &amp; Where</h2>

          <div className="space-y-2">
            <Label htmlFor="ce-starts">Starts</Label>
            <Input
              ref={startsRef}
              id="ce-starts"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="h-11 max-w-md"
              aria-invalid={Boolean(errors.starts_at)}
            />
            <p className="min-h-5 text-sm text-red-600" role={errors.starts_at ? "alert" : undefined}>
              {errors.starts_at ?? ""}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ce-ends">Ends (optional)</Label>
            <Input
              id="ce-ends"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="h-11 max-w-md"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-plum-100 bg-card px-4 py-3">
            <div>
              <p className="font-medium text-ink">Virtual event</p>
              <p className="text-sm text-ink-muted">Toggle if this is online-only.</p>
            </div>
            <Switch checked={isVirtual} onCheckedChange={setIsVirtual} />
          </div>

          {isVirtual ? (
            <div className="space-y-2">
              <Label htmlFor="ce-virtual-url">Meeting URL</Label>
              <Input
                ref={virtualRef}
                id="ce-virtual-url"
                value={virtualUrl}
                onChange={(e) => setVirtualUrl(e.target.value)}
                className="h-11"
                placeholder="https://"
                aria-invalid={Boolean(errors.virtual_url)}
              />
              <p
                className="min-h-5 text-sm text-red-600"
                role={errors.virtual_url ? "alert" : undefined}
              >
                {errors.virtual_url ?? ""}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ce-venue">Venue name</Label>
                <Input
                  ref={venueRef}
                  id="ce-venue"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ce-address">Address</Label>
                <Input
                  id="ce-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ce-city">City</Label>
                <Input id="ce-city" value={city} onChange={(e) => setCity(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ce-state">State</Label>
                <Input id="ce-state" value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="h-11" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ce-capacity">Capacity (optional)</Label>
            <Input
              id="ce-capacity"
              type="number"
              min={1}
              inputMode="numeric"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="h-11 max-w-xs"
              aria-invalid={Boolean(errors.capacity)}
            />
            <p className="min-h-5 text-sm text-red-600" role={errors.capacity ? "alert" : undefined}>
              {errors.capacity ?? ""}
            </p>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-plum-700">Review &amp; Publish</h2>

          <div className="rounded-2xl border border-plum-100 bg-card p-6 text-sm text-ink">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Title</dt>
                <dd className="font-medium">{title}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Category</dt>
                <dd>{eventCategories.find((c) => c.id === category)?.label ?? category}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Causes</dt>
                <dd>
                  {selectedCauseIds.size
                    ? CAUSES.filter((c) => selectedCauseIds.has(c.id))
                        .map((c) => c.title)
                        .join(", ")
                    : "None selected"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">When</dt>
                <dd>{startsAt || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Format</dt>
                <dd>{isVirtual ? "Virtual" : "In person"}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={publishMode}
              onValueChange={(v) => setPublishMode(v as "draft" | "published")}
            >
              <SelectTrigger className="h-11 w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Save as draft</SelectItem>
                <SelectItem value="published">Publish now</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ce-cover">Cover image URL</Label>
            <Input
              id="ce-cover"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="h-11"
              placeholder="https://"
            />
          </div>

        </div>
      ) : null}

      <p className="min-h-6 text-sm text-red-600" role={formError ? "alert" : undefined}>
        {formError ?? ""}
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={step === 1 || isPending}
          className="text-ink-muted hover:text-plum-700"
        >
          Back
        </Button>
        {step < 3 ? (
          <Button
            type="button"
            onClick={goNext}
            className="bg-chartreuse-500 font-medium text-ink hover:bg-chartreuse-700"
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isPending}
            onClick={submit}
            className="bg-plum-700 font-medium text-parchment hover:bg-plum-500"
          >
            {isPending ? "Creating…" : "Create event"}
          </Button>
        )}
      </div>
    </div>
  );
}
