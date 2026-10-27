import { db } from "@/db";
import { feedback } from "@/db/schema";
import { cleanText } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(request, "feedback", 8)) return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Please check your feedback." }, { status: 400 });
  const message = cleanText(body.message, 2000);
  const contact = cleanText(body.contact, 160);
  if (message.length < 5) return Response.json({ error: "Please write at least 5 characters." }, { status: 400 });
  try {
    await db.insert(feedback).values({ message, contact: contact || null });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "We couldn't save your feedback. Please try again." }, { status: 503 });
  }
}
