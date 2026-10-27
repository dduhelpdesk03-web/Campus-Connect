import { db } from "@/db";
import { academicEvents, faqEntries, importantLinks, notices, resources, siteSettings } from "@/db/schema";
import { asc, desc, eq, gte } from "drizzle-orm";
import { ensureSiteContent } from "@/lib/site-content";
import { officialSourceUrl } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSiteContent();
    // Use India time so an event remains visible throughout its local calendar day.
    const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [noticeList, resourceList, linkList, faqList, eventList, settings] = await Promise.all([
      db.select().from(notices).orderBy(desc(notices.publishedDate), desc(notices.id)).limit(100),
      db.select().from(resources).orderBy(desc(resources.createdAt)).limit(200),
      db.select().from(importantLinks).orderBy(asc(importantLinks.id)).limit(100),
      db.select().from(faqEntries).orderBy(asc(faqEntries.id)).limit(100),
      db.select().from(academicEvents).where(gte(academicEvents.eventDate, today)).orderBy(asc(academicEvents.eventDate), asc(academicEvents.id)).limit(30),
      db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1),
    ]);
    return Response.json({ notices: noticeList, resources: resourceList, links: linkList.map(link => ({ ...link, official: Boolean(officialSourceUrl(link.url)) })), faqs: faqList, events: eventList, settings: settings[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Content is temporarily unavailable." }, { status: 503 });
  }
}
