import { pgTable, serial, text, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const loadRequests = pgTable("load_requests", {
  id: serial().primaryKey(),
  externalId: text("external_id").notNull().unique(),
  loadId: text("load_id").notNull(),
  lane: text().notNull().default(""),
  equipment: text().notNull().default(""),
  totalPay: doublePrecision("total_pay"),
  ratePerMile: doublePrecision("rate_per_mile"),
  carrierName: text("carrier_name").notNull(),
  mcNumber: text("mc_number").notNull(),
  contactEmail: text("contact_email").notNull().default(""),
  contactPhone: text("contact_phone").notNull().default(""),
  askingRate: doublePrecision("asking_rate"),
  notes: text().notNull().default(""),
  status: text().notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
