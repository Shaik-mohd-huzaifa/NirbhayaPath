import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  emergencyContacts: json("emergency_contacts").$type<{name: string, phone: string}[]>().notNull().default([]),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startLocation: json("start_location").$type<{lat: number, lng: number}>().notNull(),
  endLocation: json("end_location").$type<{lat: number, lng: number}>().notNull(),
  safetyScore: integer("safety_score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  routeId: integer("route_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const saathiRequests = pgTable("saathi_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  routeId: integer("route_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertRouteSchema = createInsertSchema(routes);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertSaathiRequestSchema = createInsertSchema(saathiRequests);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Route = typeof routes.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type SaathiRequest = typeof saathiRequests.$inferSelect;
