import { pgTable, text, timestamp, integer, boolean, real, jsonb, uuid } from "drizzle-orm/pg-core";

export const publicQuoteRequests = pgTable("public_quote_requests", {
  id: uuid().primaryKey().defaultRandom(),
  trackingNumber: text("tracking_number").notNull(),
  company: text().notNull(),
  contact: text().notNull(),
  email: text().notNull(),
  phone: text(),
  origin: text().notNull(),
  destination: text().notNull(),
  freightType: text("freight_type").notNull(),
  equipment: text().notNull().default("Dry van"),
  weightLbs: integer("weight_lbs"),
  laneMiles: integer("lane_miles"),
  dimensions: text(),
  pickupDate: text("pickup_date"),
  deliveryDate: text("delivery_date"),
  instructions: text(),
  estimateLow: integer("estimate_low"),
  estimateMid: integer("estimate_mid"),
  estimateHigh: integer("estimate_high"),
  estimateRpm: real("estimate_rpm"),
  estimateConfidence: integer("estimate_confidence"),
  status: text().notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const publicShipments = pgTable("public_shipments", {
  id: uuid().primaryKey().defaultRandom(),
  trackingNumber: text("tracking_number").notNull().unique(),
  quoteRequestId: uuid("quote_request_id"),
  route: text().notNull(),
  origin: text().notNull(),
  destination: text().notNull(),
  status: text().notNull().default("Quote received"),
  pickupDate: text("pickup_date"),
  deliveryDate: text("delivery_date"),
  eta: text(),
  equipment: text(),
  publicNotes: text("public_notes"),
  timeline: jsonb(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  company: text(),
  email: text().notNull(),
  phone: text(),
  topic: text().notNull(),
  message: text().notNull(),
  status: text().notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const driverApplications = pgTable("driver_applications", {
  id: uuid().primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  city: text(),
  state: text(),
  equipment: text(),
  notes: text(),
  status: text().notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const partnerApplications = pgTable("partner_applications", {
  id: uuid().primaryKey().defaultRandom(),
  company: text().notNull(),
  contactName: text("contact_name").notNull(),
  email: text().notNull(),
  phone: text(),
  category: text(),
  region: text(),
  notes: text(),
  status: text().notNull().default("new"),
  reviewed: boolean().notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
