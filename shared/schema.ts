import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  address: text("address"),
  gst: text("gst"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  defaultDuration: integer("default_duration").notNull(), // in months
  defaultPrice: doublePrecision("default_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

// Renewal schema
export const renewals = pgTable("renewals", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  serviceId: integer("service_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  amount: doublePrecision("amount").notNull(),
  isPaid: boolean("is_paid").default(false),
  notificationSent: boolean("notification_sent").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create and customize the renewal schema to handle string dates
export const insertRenewalSchema = createInsertSchema(renewals)
  .omit({
    id: true,
    createdAt: true,
    notificationSent: true,
  })
  .extend({
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
  });

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // payment_received, client_added, renewal_reminder, service_updated
  description: text("description").notNull(),
  metadata: text("metadata"), // json string
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Renewal = typeof renewals.$inferSelect;
export type InsertRenewal = z.infer<typeof insertRenewalSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Extended schema for frontend
export const renewalWithRelationsSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  serviceId: z.number(),
  startDate: z.date().or(z.string()),
  endDate: z.date().or(z.string()),
  amount: z.number(),
  isPaid: z.boolean(),
  notificationSent: z.boolean(),
  notes: z.string().optional().nullable(),
  createdAt: z.date().or(z.string()),
  client: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    company: z.string().optional().nullable(),
  }),
  service: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export type RenewalWithRelations = z.infer<typeof renewalWithRelationsSchema>;

// Dashboard stats schema
export const dashboardStatsSchema = z.object({
  totalClients: z.number(),
  activeServices: z.number(),
  pendingRenewals: z.number(),
  revenue: z.object({
    mtd: z.number(),
    ytd: z.number(),
    projected: z.number(),
  }),
  upcomingRenewals: z.array(renewalWithRelationsSchema),
  recentActivities: z.array(z.object({
    id: z.number(),
    type: z.string(),
    description: z.string(),
    metadata: z.string().optional().nullable(),
    createdAt: z.date().or(z.string()),
  })),
  monthlyRevenue: z.array(z.object({
    month: z.string(),
    amount: z.number(),
  })),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
