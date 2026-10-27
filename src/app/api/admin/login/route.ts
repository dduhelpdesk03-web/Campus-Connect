import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, makeAdminSession, passwordMatches } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(request, "admin-login", 8)) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  if (!adminConfigured()) return NextResponse.json({ error: "Admin access is not configured. Set ADMIN_PASSWORD (at least 12 characters) and a different ADMIN_SESSION_SECRET (at least 32 characters) on the server." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.password !== "string" || !passwordMatches(body.password)) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, makeAdminSession(), adminCookieOptions);
  return response;
}
