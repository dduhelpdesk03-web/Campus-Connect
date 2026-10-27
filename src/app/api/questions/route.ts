import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cleanText } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(request, "question", 8)) return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Please check your submission." }, { status: 400 });
  const question = cleanText(body.question, 2000);
  const semester = cleanText(body.semester, 40);
  const subject = cleanText(body.subject, 120);
  const contact = cleanText(body.contact, 160);
  if (question.length < 10 || !semester || !subject) {
    return Response.json({ error: "Please add your question (at least 10 characters), semester and subject." }, { status: 400 });
  }
  const reference = `DDU-${randomBytes(12).toString("hex").toUpperCase()}`;
  try {
    await db.insert(questions).values({ reference, question, semester, subject, contact: contact || null });
    return Response.json({ reference, status: "Received" }, { status: 201 });
  } catch {
    return Response.json({ error: "We couldn't save your question. Please try again." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  if (!rateLimit(request, "track", 40)) return Response.json({ error: "Too many lookups. Please try again later." }, { status: 429 });
  const reference = new URL(request.url).searchParams.get("reference")?.trim().toUpperCase() || "";
  if (!/^DDU-[A-F0-9]{24}$/.test(reference)) return Response.json({ error: "Enter the complete reference code from your submission." }, { status: 400 });
  try {
    const [result] = await db.select({ status: questions.status, answer: questions.answer, createdAt: questions.createdAt }).from(questions).where(eq(questions.reference, reference)).limit(1);
    if (!result) return Response.json({ error: "No question was found with that reference code." }, { status: 404 });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tracking is temporarily unavailable." }, { status: 503 });
  }
}
