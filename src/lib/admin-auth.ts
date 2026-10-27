import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "campus_admin";
const SESSION_SECONDS = 60 * 60 * 8;

export function adminConfigured() {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return password.length >= 12 && secret.length >= 32 && password !== secret && password !== "replace-with-a-long-unique-password" && secret !== "replace-with-a-random-secret-at-least-32-characters-long";
}

export function passwordMatches(candidate: string) {
  if (!adminConfigured()) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(candidate), digest(process.env.ADMIN_PASSWORD!));
}

function signature(expires: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(`campus-connect:${expires}`).digest("hex");
}

export function makeAdminSession() {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expires}.${signature(expires)}`;
}

export function isAdmin(request: NextRequest) {
  if (!adminConfigured()) return false;
  const token = request.cookies.get(ADMIN_COOKIE)?.value || "";
  const [expires, provided, extra] = token.split(".");
  if (extra || !/^\d{10}$/.test(expires || "") || !/^[a-f0-9]{64}$/.test(provided || "")) return false;
  const now = Math.floor(Date.now() / 1000);
  const expiry = Number(expires);
  if (expiry <= now || expiry > now + SESSION_SECONDS) return false;
  return timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(signature(expires), "hex"));
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};
