import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  question: text("question").notNull(),
  semester: varchar("semester", { length: 40 }).notNull(),
  subject: varchar("subject", { length: 120 }).notNull(),
  contact: varchar("contact", { length: 160 }),
  status: varchar("status", { length: 30 }).notNull().default("Received"),
  answer: text("answer").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  contact: varchar("contact", { length: 160 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  summary: text("summary").notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  publishedDate: varchar("published_date", { length: 10 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  subject: varchar("subject", { length: 120 }).notNull(),
  semester: varchar("semester", { length: 40 }).notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey(),
  welcomeTitle: varchar("welcome_title", { length: 100 }).notNull(),
  welcomeDescription: varchar("welcome_description", { length: 200 }).notNull(),
  heroLine1: varchar("hero_line_1", { length: 80 }).notNull(),
  heroLine2: varchar("hero_line_2", { length: 80 }).notNull(),
  heroDescription: text("hero_description").notNull(),
  showDemoContent: boolean("show_demo_content").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const importantLinks = pgTable("important_links", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 120 }).notNull(),
  subtitle: varchar("subtitle", { length: 160 }).notNull(),
  url: text("url").notNull(),
  icon: varchar("icon", { length: 30 }).notNull().default("link"),
  shortcut: varchar("shortcut", { length: 30 }).notNull().default("none"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faqEntries = pgTable("faq_entries", {
  id: serial("id").primaryKey(),
  question: varchar("question", { length: 220 }).notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const academicEvents = pgTable("academic_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  eventDate: varchar("event_date", { length: 10 }).notNull(),
  location: varchar("location", { length: 160 }).notNull().default(""),
  sourceUrl: text("source_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
