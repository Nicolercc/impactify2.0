import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const sp = await searchParams;
  const organizerIntent = sp.intent === "organizer";

  return (
    <AuthCard>
      <SignUpForm organizerIntent={organizerIntent} />
    </AuthCard>
  );
}
