"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signUp, signInWithGoogle } from "@/app/actions/auth";
import { signUpSchema } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/google-button";

function passwordStrengthScore(password: string): number {
  if (password.length < 8) return 0;
  let score = 1;
  if (/[0-9]|[^a-zA-Z0-9]/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  return Math.min(3, score);
}

function StrengthMeter({ score }: { score: number }) {
  return (
    <div className="flex gap-1.5" aria-label="Password strength" role="status">
      {[0, 1, 2].map((i) => {
        let cls = "h-1.5 flex-1 rounded-full bg-plum-100";
        if (score >= 3) cls = "h-1.5 flex-1 rounded-full bg-chartreuse-500";
        else if (score >= 2 && i <= 1) cls = "h-1.5 flex-1 rounded-full bg-peach-600";
        else if (score >= 1 && i === 0) cls = "h-1.5 flex-1 rounded-full bg-peach-600";
        return <div key={i} className={cls} />;
      })}
    </div>
  );
}

type SignUpFormProps = {
  organizerIntent?: boolean;
};

export function SignUpForm({ organizerIntent }: SignUpFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const strength = passwordStrengthScore(password);
  const busy = isPending || googlePending;

  function focusFirstError(errors: {
    username?: string;
    email?: string;
    password?: string;
  }) {
    if (errors.username) usernameRef.current?.focus();
    else if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = signUpSchema.safeParse({ email, password, username });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next = {
        username: flat.username?.[0],
        email: flat.email?.[0],
        password: flat.password?.[0],
      };
      setFieldErrors(next);
      focusFirstError(next);
      return;
    }

    startTransition(async () => {
      const { error } = await signUp(
        parsed.data.email,
        parsed.data.password,
        parsed.data.username,
      );
      if (error) {
        setFormError(error.message);
        return;
      }
      router.push("/onboarding");
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

  return (
    <div className="font-sans text-ink">
      <h1 className="font-serif text-[32px] font-medium leading-tight text-plum-700">
        Join Impactify.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Create your account to RSVP to events, follow causes, and take action.
      </p>
      {organizerIntent ? (
        <p className="mt-2 text-xs text-ink-muted">
          You&apos;re signing up to organize events. We&apos;ll use this in a later step.
        </p>
      ) : null}

      <div className="mt-8">
        <GoogleButton
          onPress={handleGoogle}
          pending={googlePending}
          disabled={busy}
          label="Continue with Google"
        />
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
          <Label htmlFor="signup-username" className="text-sm font-medium text-ink">
            Username
          </Label>
          <Input
            ref={usernameRef}
            id="signup-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby="signup-username-hint signup-username-error"
            className="h-11"
          />
          <p id="signup-username-hint" className="text-xs text-ink-muted">
            3–30 characters, letters, numbers, and underscores only.
          </p>
          <p
            id="signup-username-error"
            className="min-h-[1.25rem] text-sm text-red-600"
            role={fieldErrors.username ? "alert" : undefined}
          >
            {fieldErrors.username ?? ""}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium text-ink">
            Email
          </Label>
          <Input
            ref={emailRef}
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
            className="h-11"
          />
          <p
            id="signup-email-error"
            className="min-h-[1.25rem] text-sm text-red-600"
            role={fieldErrors.email ? "alert" : undefined}
          >
            {fieldErrors.email ?? ""}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-sm font-medium text-ink">
            Password
          </Label>
          <div className="relative">
            <Input
              ref={passwordRef}
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby="signup-password-strength signup-password-error"
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
          <div id="signup-password-strength" className="pt-1">
            <StrengthMeter score={strength} />
          </div>
          <p className="text-xs text-ink-muted">At least 8 characters.</p>
          <p
            id="signup-password-error"
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
          {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Sign up
        </Button>

        <p
          className="min-h-[1.25rem] text-center text-sm text-red-600"
          role={formError ? "alert" : undefined}
        >
          {formError ?? ""}
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="font-medium text-plum-700 underline-offset-4 hover:underline"
        >
          Sign in →
        </Link>
      </p>

      <p className="mt-6 text-center text-xs leading-relaxed text-ink-muted">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-plum-700">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-plum-700">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
