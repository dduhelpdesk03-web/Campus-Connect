import { NextRequest } from "next/server";
import { db } from "@/db";
import { academicEvents, faqEntries, feedback, importantLinks, notices, questions, resources, siteSettings } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin-auth";
import { cleanText, officialSourceUrl, safeHttpsUrl } from "@/lib/validation";
import { ensureSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

const noticeCategories = ["General", "Examination", "Admissions", "Scholarship", "Academics"];
const resourceCategories = ["Notes", "Syllabus", "Assignment", "Previous papers"];
const statuses = ["Received", "In Progress", "Answered"];
const linkIcons = ["university", "examination", "results", "scholarship", "admission", "link"];
const shortcuts = ["none", "results", "scholarships"];

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function noticeValues(body: Record<string, unknown>) {
  const title = cleanText(body.title, 180), summary = cleanText(body.summary, 1200), category = cleanText(body.category, 40), publishedDate = cleanText(body.publishedDate, 10), sourceUrl = officialSourceUrl(body.sourceUrl);
  if (!title || !summary || !noticeCategories.includes(category) || !validDate(publishedDate) || !sourceUrl) return null;
  return { title, summary, category, publishedDate, sourceUrl };
}
function resourceValues(body: Record<string, unknown>) {
  const title = cleanText(body.title, 180), subject = cleanText(body.subject, 120), semester = cleanText(body.semester, 40), category = cleanText(body.category, 40), description = cleanText(body.description, 1200), url = safeHttpsUrl(body.url);
  if (!title || !subject || !semester || !resourceCategories.includes(category) || !description || !url) return null;
  return { title, subject, semester, category, description, url };
}
function linkValues(body: Record<string, unknown>) {
  const title = cleanText(body.title, 120), subtitle = cleanText(body.subtitle, 160), url = safeHttpsUrl(body.url), icon = cleanText(body.icon, 30), shortcut = cleanText(body.shortcut, 30);
  if (!title || !subtitle || !url || !linkIcons.includes(icon) || !shortcuts.includes(shortcut)) return null;
  return { title, subtitle, url, icon, shortcut };
}
function faqValues(body: Record<string, unknown>) {
  const question = cleanText(body.question, 220), answer = cleanText(body.answer, 3000);
  return question && answer ? { question, answer } : null;
}
function eventValues(body: Record<string, unknown>) {
  const title = cleanText(body.title, 180), description = cleanText(body.description, 1200), eventDate = cleanText(body.eventDate, 10), location = cleanText(body.location, 160), sourceUrl = officialSourceUrl(body.sourceUrl);
  if (!title || !description || !validDate(eventDate) || !sourceUrl) return null;
  return { title, description, eventDate, location, sourceUrl };
}
function settingsValues(body: Record<string, unknown>) {
  const welcomeTitle = cleanText(body.welcomeTitle, 100), welcomeDescription = cleanText(body.welcomeDescription, 200), heroLine1 = cleanText(body.heroLine1, 80), heroLine2 = cleanText(body.heroLine2, 80), heroDescription = cleanText(body.heroDescription, 400);
  if (!welcomeTitle || !welcomeDescription || !heroLine1 || !heroLine2 || !heroDescription || typeof body.showDemoContent !== "boolean") return null;
  return { welcomeTitle, welcomeDescription, heroLine1, heroLine2, heroDescription, showDemoContent: body.showDemoContent, updatedAt: new Date() };
}
function unauthorized() { return Response.json({ error: "Administrator sign-in required." }, { status: 401 }); }
function invalid(message = "Please complete all fields with valid information.") { return Response.json({ error: message }, { status: 400 }); }

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  try {
    await ensureSiteContent();
    const [questionList, noticeList, resourceList, feedbackList, linkList, faqList, eventList, settings] = await Promise.all([
      db.select().from(questions).orderBy(desc(questions.createdAt)).limit(300),
      db.select().from(notices).orderBy(desc(notices.publishedDate)).limit(200),
      db.select().from(resources).orderBy(desc(resources.createdAt)).limit(200),
      db.select().from(feedback).orderBy(desc(feedback.createdAt)).limit(200),
      db.select().from(importantLinks).orderBy(asc(importantLinks.id)).limit(100),
      db.select().from(faqEntries).orderBy(asc(faqEntries.id)).limit(100),
      db.select().from(academicEvents).orderBy(asc(academicEvents.eventDate), asc(academicEvents.id)).limit(100),
      db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1),
    ]);
    return Response.json({ questions: questionList, notices: noticeList, resources: resourceList, feedback: feedbackList, links: linkList, faqs: faqList, events: eventList, settings: settings[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Unable to load the dashboard." }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return invalid();
  try {
    if (body.type === "notice") {
      const values = noticeValues(body); if (!values) return invalid("Complete all notice fields and use an approved official HTTPS source URL.");
      await db.insert(notices).values(values);
    } else if (body.type === "resource") {
      const values = resourceValues(body); if (!values) return invalid("Complete all resource fields and use a valid HTTPS link.");
      await db.insert(resources).values(values);
    } else if (body.type === "link") {
      const values = linkValues(body); if (!values) return invalid("Complete all link fields and use a valid HTTPS URL.");
      await db.insert(importantLinks).values(values);
    } else if (body.type === "faq") {
      const values = faqValues(body); if (!values) return invalid("Please enter both a question and an answer.");
      await db.insert(faqEntries).values(values);
    } else if (body.type === "event") {
      const values = eventValues(body); if (!values) return invalid("Complete the event fields and use an approved official HTTPS source URL.");
      await db.insert(academicEvents).values(values);
    } else return invalid();
    return Response.json({ ok: true }, { status: 201 });
  } catch { return Response.json({ error: "Could not save this item." }, { status: 503 }); }
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!body || !Number.isSafeInteger(id) || id < 1) return invalid();
  try {
    if (body.type === "question") {
      const status = cleanText(body.status, 30), answer = cleanText(body.answer, 3000);
      if (!statuses.includes(status) || (status === "Answered" && !answer)) return invalid("Choose a valid status. Answered questions need an answer.");
      const updated = await db.update(questions).set({ status, answer, updatedAt: new Date() }).where(eq(questions.id, id)).returning({ id: questions.id });
      if (!updated.length) return Response.json({ error: "Question not found." }, { status: 404 });
    } else if (body.type === "notice") {
      const values = noticeValues(body); if (!values) return invalid("Complete all notice fields and use an approved official HTTPS source URL.");
      const updated = await db.update(notices).set(values).where(eq(notices.id, id)).returning({ id: notices.id }); if (!updated.length) return Response.json({ error: "Notice not found." }, { status: 404 });
    } else if (body.type === "resource") {
      const values = resourceValues(body); if (!values) return invalid("Complete all resource fields and use a valid HTTPS link.");
      const updated = await db.update(resources).set(values).where(eq(resources.id, id)).returning({ id: resources.id }); if (!updated.length) return Response.json({ error: "Resource not found." }, { status: 404 });
    } else if (body.type === "link") {
      const values = linkValues(body); if (!values) return invalid("Complete all link fields and use a valid HTTPS URL.");
      const updated = await db.update(importantLinks).set(values).where(eq(importantLinks.id, id)).returning({ id: importantLinks.id }); if (!updated.length) return Response.json({ error: "Link not found." }, { status: 404 });
    } else if (body.type === "faq") {
      const values = faqValues(body); if (!values) return invalid("Please enter both a question and an answer.");
      const updated = await db.update(faqEntries).set(values).where(eq(faqEntries.id, id)).returning({ id: faqEntries.id }); if (!updated.length) return Response.json({ error: "FAQ not found." }, { status: 404 });
    } else if (body.type === "event") {
      const values = eventValues(body); if (!values) return invalid("Complete the event fields and use an approved official HTTPS source URL.");
      const updated = await db.update(academicEvents).set(values).where(eq(academicEvents.id, id)).returning({ id: academicEvents.id }); if (!updated.length) return Response.json({ error: "Event not found." }, { status: 404 });
    } else if (body.type === "settings" && id === 1) {
      const values = settingsValues(body); if (!values) return invalid("Please complete all homepage text fields.");
      const updated = await db.update(siteSettings).set(values).where(eq(siteSettings.id, 1)).returning({ id: siteSettings.id }); if (!updated.length) return Response.json({ error: "Settings not found." }, { status: 404 });
    } else return invalid();
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Could not update this item." }, { status: 503 }); }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!body || !Number.isSafeInteger(id) || id < 1) return invalid();
  try {
    if (body.type === "notice") await db.delete(notices).where(eq(notices.id, id));
    else if (body.type === "resource") await db.delete(resources).where(eq(resources.id, id));
    else if (body.type === "link") await db.delete(importantLinks).where(eq(importantLinks.id, id));
    else if (body.type === "faq") await db.delete(faqEntries).where(eq(faqEntries.id, id));
    else if (body.type === "event") await db.delete(academicEvents).where(eq(academicEvents.id, id));
    else if (body.type === "question") await db.delete(questions).where(eq(questions.id, id));
    else if (body.type === "feedback") await db.delete(feedback).where(eq(feedback.id, id));
    else return invalid();
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Could not delete this item." }, { status: 503 }); }
}
