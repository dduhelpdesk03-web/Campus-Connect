import "server-only";
import { db } from "@/db";
import { faqEntries, importantLinks, siteSettings } from "@/db/schema";
import { defaultFaqs, defaultLinks, defaultSettings } from "@/lib/site-defaults";

// Initialize once. The settings row is the marker, so deleting all links or FAQs
// does not bring the defaults back on the next page load.
export async function ensureSiteContent() {
  await db.transaction(async tx => {
    const inserted = await tx.insert(siteSettings).values(defaultSettings).onConflictDoNothing().returning({ id: siteSettings.id });
    if (inserted.length) {
      await tx.insert(importantLinks).values(defaultLinks);
      await tx.insert(faqEntries).values(defaultFaqs);
    }
  });
}
