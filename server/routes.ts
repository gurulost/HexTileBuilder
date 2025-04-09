import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Add routes for our game implementations
  app.get('/game', (req, res) => {
    res.sendFile('game.html', { root: './client/public' });
  });
  
  // Add a route for our perfected hexagonal grid implementation
  app.get('/game-perfect', (req, res) => {
    res.sendFile('game-perfect.html', { root: './client/public' });
  });
  
  // Add a route for our final precisely aligned hexagonal grid
  app.get('/game-perfect-final', (req, res) => {
    res.sendFile('game-perfect-final.html', { root: './client/public' });
  });
  
  // Add a route for our spread out hexagonal grid with increased horizontal spacing
  app.get('/game-spread', (req, res) => {
    res.sendFile('game-spread.html', { root: './client/public' });
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
