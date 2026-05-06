import { NextResponse } from "next/server";
import { signOut } from "@/app/actions/auth";

export async function POST(req: Request) {
  await signOut();
  return NextResponse.redirect(new URL("/", req.url));
}
