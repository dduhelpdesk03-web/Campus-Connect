// A small per-instance guard for the prototype. Use a shared rate limiter in multi-instance production.
const attempts = new Map<string, { count: number; reset: number }>();

export function rateLimit(request: Request, action: string, max: number, windowMs = 15 * 60 * 1000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${action}:${ip}`;
  const now = Date.now();
  if (attempts.size > 5000) {
    for (const [entry, value] of attempts) if (value.reset < now) attempts.delete(entry);
  }
  const existing = attempts.get(key);
  if (!existing || existing.reset < now) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (existing.count >= max) return false;
  existing.count += 1;
  return true;
}
