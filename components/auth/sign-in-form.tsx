"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  signIn,
  signInAnonymously,
  signInWithGoogle,
} from "@/app/actions/auth";
import { signInSchema } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/google-button";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);
  const [guestPending, setGuestPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const urlError = searchParams.get("error");
  const displayFormError =
    formError ?? (urlError === "auth_failed" ? "Google sign-in failed. Try again." : null);

  function focusFirstError(errors: { email?: string; password?: string }) {
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next = {
        email: flat.email?.[0],
        password: flat.password?.[0],
      };
      setFieldErrors(next);
      focusFirstError(next);
      return;
    }

    startTransition(async () => {
      const { error } = await signIn(parsed.data.email, parsed.data.password);
      if (error) {
        setFormError(error.message);
        return;
      }
      router.push("/feed");
      router.refresh();
    });
  }

  async function handleGoogle() {
    setFormError(null);
    setFieldErrors({});
    setGooglePending(true);
    const { data, error } = await signInWithGoogle();
    setGooglePending(false);
    if (error || !data?.url) {
      setFormError(error?.message ?? "Could not start Google sign-in.");
      return;
    }
    window.location.href = data.url;
  }

  async function handleGuest() {
    setFormError(null);
    setFieldErrors({});
    setGuestPending(true);
    const { error } = await signInAnonymously();
    setGuestPending(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  const busy = isPending || googlePending || guestPending;

  return (
    <div className="font-sans text-ink">
      <h1 className="font-serif text-[32px] font-medium leading-tight text-plum-700">
        Welcome back.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Sign in to save events, follow causes, and track your impact.
      </p>

      <div className="mt-8">
        <GoogleButton onPress={handleGoogle} pending={googlePending} disabled={busy} />
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-plum-100" />
        </div>
        <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide text-ink-muted">
          <span className="bg-card px-3">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="signin-email" className="text-sm font-medium text-ink">
            Email
          </Label>
          <Input
            ref={emailRef}
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "signin-email-error" : undefined}
            className="h-11"
          />
          <p
            id="signin-email-error"
            className="min-h-[1.25rem] text-sm text-red-600"
            role={fieldErrors.email ? "alert" : undefined}
          >
            {fieldErrors.email ?? ""}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signin-password" className="text-sm font-medium text-ink">
            Password
          </Label>
          <div className="relative">
            <Input
              ref={passwordRef}
              id="signin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "signin-password-error" : undefined}
              className="h-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-2 text-ink-muted hover:text-plum-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={busy}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p
            id="signin-password-error"
            className="min-h-[1.25rem] text-sm text-red-600"
            role={fieldErrors.password ? "alert" : undefined}
          >
            {fieldErrors.password ?? ""}
          </p>
        </div>

        <Button
          type="submit"
          disabled={busy}
          className="h-11 w-full bg-plum-700 font-medium text-parchment hover:bg-plum-500"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          Sign in
        </Button>

        <p
          className="min-h-[1.25rem] text-center text-sm text-red-600"
          role={displayFormError ? "alert" : undefined}
        >
          {displayFormError ?? ""}
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-medium text-plum-700 underline-offset-4 hover:underline"
        >
          Sign up →
        </Link>
      </p>

      <p className="mt-4 text-center">
        <button
          type="button"
          onClick={() => void handleGuest()}
          disabled={busy}
          className="text-sm text-ink-muted underline decoration-ink-muted underline-offset-4 hover:text-plum-700"
        >
          {guestPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Continuing…
            </span>
          ) : (
            "Continue as guest →"
          )}
        </button>
      </p>
    </div>
  );
}
