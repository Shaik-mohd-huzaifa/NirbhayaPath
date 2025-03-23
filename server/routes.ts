import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertRouteSchema, insertReviewSchema, insertSaathiRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Routes API
  app.get("/api/routes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const routes = await storage.getRoutesByUser(req.user.id);
    res.json(routes);
  });

  app.post("/api/routes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parseResult = insertRouteSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const route = await storage.createRoute({
      ...parseResult.data,
      userId: req.user.id,
      safetyScore: parseResult.data.safetyScore || 85, // Default safety score
    });
    res.status(201).json(route);
  });

  // Reviews API
  app.get("/api/routes/:routeId/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const reviews = await storage.getReviewsByRoute(parseInt(req.params.routeId));
    res.json(reviews);
  });

  app.post("/api/routes/:routeId/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parseResult = insertReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const review = await storage.createReview({
      ...parseResult.data,
      userId: req.user.id,
      routeId: parseInt(req.params.routeId),
      comment: parseResult.data.comment || null,
    });
    res.status(201).json(review);
  });

  // Saathi API
  app.get("/api/saathis", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Mock data for now - in production, this would come from the database
    const saathis = [
      {
        id: 1,
        name: "Priya Sharma",
        rating: 4.8,
        totalTrips: 156,
        currentLocation: {
          lat: 28.6139,
          lng: 77.2090
        },
        status: "available"
      },
      {
        id: 2,
        name: "Anjali Patel",
        rating: 4.9,
        totalTrips: 203,
        currentLocation: {
          lat: 28.6145,
          lng: 77.2095
        },
        currentRoute: {
          startLocation: {
            lat: 28.6145,
            lng: 77.2095
          },
          endLocation: {
            lat: 28.6150,
            lng: 77.2100
          }
        },
        status: "on_trip"
      },
      {
        id: 3,
        name: "Meera Singh",
        rating: 4.7,
        totalTrips: 98,
        currentLocation: {
          lat: 28.6155,
          lng: 77.2110
        },
        status: "offline"
      }
    ];
    
    res.json(saathis);
  });

  app.get("/api/saathi/requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const requests = await storage.getSaathiRequestsByUser(req.user.id);
    res.json(requests);
  });

  app.post("/api/saathi/requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parseResult = insertSaathiRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const request = await storage.createSaathiRequest({
      ...parseResult.data,
      userId: req.user.id,
      status: parseResult.data.status || "pending",
    });
    res.status(201).json(request);
  });

  app.patch("/api/saathi/requests/:requestId/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { status } = req.body;
    if (typeof status !== "string" || !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await storage.updateSaathiRequestStatus(
      parseInt(req.params.requestId),
      status
    );
    res.json(request);
  });

  // Emergency API
  app.post("/api/emergency/alert", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { contacts, location } = req.body;
    if (!contacts || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // In a real implementation, this would:
    // 1. Send SMS/calls to emergency contacts
    // 2. Alert nearby volunteers
    // 3. Store the emergency event
    // 4. Potentially contact authorities
    
    // For now, we'll simulate success
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
