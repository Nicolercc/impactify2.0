import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/get-session";
import { CreateEventForm } from "@/components/events/create-event-form";

export default async function NewEventPage() {
  const user = await getSession();
  if (!user) {
    redirect("/auth/sign-in?intent=organizer");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "organizer" && profile.role !== "admin")) {
    redirect("/auth/sign-in?intent=organizer");
  }

  return (
    <div className="min-h-screen bg-parchment px-4 pb-24 pt-6 md:pt-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-medium text-plum-700 md:text-4xl">
          Create an event
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Tell your story, pick a time and place, then publish when you&apos;re ready.
        </p>
        <CreateEventForm />
      </div>
    </div>
  );
}
