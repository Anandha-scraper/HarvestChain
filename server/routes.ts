import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import farmerRoutes from "./routes/farmerRoutes";
import adminRoutes from "./routes/adminRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Farmer routes
  app.use('/api/farmers', farmerRoutes);

  // Admin routes
  app.use('/api/admin', adminRoutes);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
