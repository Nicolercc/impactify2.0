import { NextResponse } from "next/server";

function isValidEmail(email: string) {
  // Conservative enough for UX validation; avoids rejecting valid-but-rare addresses.
  return /.+@.+\..+/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const email = typeof (body as any).email === "string" ? ((body as any).email as string).trim() : "";
    const agreeToPrivacy = Boolean((body as any).agreeToPrivacy);
    const interestsRaw = (body as any).interests;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
    }
    if (!agreeToPrivacy) {
      return NextResponse.json({ ok: false, error: "Please agree to the privacy policy." }, { status: 400 });
    }

    const interests =
      Array.isArray(interestsRaw) ? interestsRaw.filter((x) => typeof x === "string").slice(0, 12) : [];

    // NOTE: This endpoint is intentionally “integration-ready”.
    // If you wire Mailchimp (double opt-in) or a DB-backed list later,
    // this is the contract the UI already uses.
    //
    // For now, we return a success response to unblock UX demos without leaking secrets
    // or requiring external vendor keys in local dev.
    void interests; // reserved for future segmentation

    return NextResponse.json(
      {
        ok: true,
        message: "Check your email to confirm your subscription.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
}

