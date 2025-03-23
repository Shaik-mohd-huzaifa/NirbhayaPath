import { User, Route, Review, SaathiRequest, type InsertUser, users, routes, reviews, saathiRequests } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createRoute(route: Omit<Route, "id" | "createdAt">): Promise<Route>;
  getRoute(id: number): Promise<Route | undefined>;
  getRoutesByUser(userId: number): Promise<Route[]>;

  createReview(review: Omit<Review, "id" | "createdAt">): Promise<Review>;
  getReviewsByRoute(routeId: number): Promise<Review[]>;

  createSaathiRequest(request: Omit<SaathiRequest, "id" | "createdAt">): Promise<SaathiRequest>;
  getSaathiRequestsByUser(userId: number): Promise<SaathiRequest[]>;
  updateSaathiRequestStatus(id: number, status: string): Promise<SaathiRequest>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createRoute(route: Omit<Route, "id" | "createdAt">): Promise<Route> {
    const [newRoute] = await db.insert(routes).values(route).returning();
    return newRoute;
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route;
  }

  async getRoutesByUser(userId: number): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.userId, userId));
  }

  async createReview(review: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByRoute(routeId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.routeId, routeId));
  }

  async createSaathiRequest(request: Omit<SaathiRequest, "id" | "createdAt">): Promise<SaathiRequest> {
    const [newRequest] = await db.insert(saathiRequests).values(request).returning();
    return newRequest;
  }

  async getSaathiRequestsByUser(userId: number): Promise<SaathiRequest[]> {
    return await db.select().from(saathiRequests).where(eq(saathiRequests.userId, userId));
  }

  async updateSaathiRequestStatus(id: number, status: string): Promise<SaathiRequest> {
    const [updatedRequest] = await db
      .update(saathiRequests)
      .set({ status })
      .where(eq(saathiRequests.id, id))
      .returning();
    return updatedRequest;
  }
}

export const storage = new DatabaseStorage();