import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const visitors = sqliteTable("visitors", {
  id: text("id").primaryKey(),
  color: text("color").notNull(),
  firstSeenAt: text("first_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  firstReferrer: text("first_referrer").notNull().default("direct"),
  firstUtmSource: text("first_utm_source").notNull().default(""),
  isExcluded: integer("is_excluded", { mode: "boolean" }).notNull().default(false),
}, (table) => [index("visitors_last_seen_idx").on(table.lastSeenAt)]);

export const visits = sqliteTable("visits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  visitorId: text("visitor_id").notNull(),
  path: text("path").notNull(),
  referrer: text("referrer").notNull().default("direct"),
  utmSource: text("utm_source").notNull().default(""),
  utmMedium: text("utm_medium").notNull().default(""),
  utmCampaign: text("utm_campaign").notNull().default(""),
  device: text("device").notNull().default("desktop"),
  browser: text("browser").notNull().default("other"),
  country: text("country").notNull().default("unknown"),
  visitDate: text("visit_date").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("visits_created_at_idx").on(table.createdAt),
  index("visits_visitor_id_idx").on(table.visitorId),
  index("visits_visit_date_idx").on(table.visitDate),
]);

export const consultations = sqliteTable("consultations", {
  id: text("id").primaryKey(),
  visitorId: text("visitor_id").notNull(),
  companyName: text("company_name").notNull().default(""),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  interest: text("interest").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("consultations_status_idx").on(table.status),
  index("consultations_created_at_idx").on(table.createdAt),
]);
