import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

function SignInFormFallback() {
  return (
    <div className="font-sans text-ink-muted" aria-busy>
      Loading…
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthCard>
      <Suspense fallback={<SignInFormFallback />}>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
