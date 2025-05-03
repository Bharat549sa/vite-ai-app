import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  registerSchema, 
  firebaseUserSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      // Validate the request body against the register schema
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.format() 
        });
      }
      
      const { username, email, password } = validationResult.data;
      
      // Check if user with same email already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({ message: "Email already in use" });
      }
      
      // Check if username is already taken
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password, // In a real app, we'd hash this password
        displayName: username,
        photoURL: null,
        firebaseUid: null,
      });
      
      // Remove sensitive information before sending response
      const { password: _, ...safeUser } = newUser;
      
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  // User login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      // Validate the request body against the login schema
      const validationResult = loginSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.format() 
        });
      }
      
      const { email, password } = validationResult.data;
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if password matches (in a real app, we'd compare hashed passwords)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Update last login
      await storage.updateLastLogin(user.id);
      
      // Remove sensitive information before sending response
      const { password: _, ...safeUser } = user;
      
      res.status(200).json(safeUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // Firebase user authentication
  app.post("/api/firebase-auth", async (req, res) => {
    try {
      // Validate the request body against the firebase user schema
      const validationResult = firebaseUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.format() 
        });
      }
      
      const firebaseUser = validationResult.data;
      
      // Check if user with firebase UID already exists
      let user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      
      if (user) {
        // Update existing user
        user = await storage.updateLastLogin(user.id);
      } else {
        // Check if user with same email exists
        if (firebaseUser.email) {
          const userByEmail = await storage.getUserByEmail(firebaseUser.email);
          
          if (userByEmail) {
            // Link firebase account to existing user
            user = await storage.updateUser(userByEmail.id, {
              firebaseUid: firebaseUser.uid,
              displayName: firebaseUser.displayName || userByEmail.displayName,
              photoURL: firebaseUser.photoURL || userByEmail.photoURL,
            });
            
            if (user) {
              // Update last login
              user = await storage.updateLastLogin(user.id);
            }
          } else {
            // Create new user from firebase data
            user = await storage.createUser({
              username: firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              password: '', // We don't need password for firebase users
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL,
              firebaseUid: firebaseUser.uid,
            });
          }
        }
      }
      
      if (!user) {
        return res.status(500).json({ message: "Failed to authenticate user" });
      }
      
      // Remove sensitive information before sending response
      const { password: _, ...safeUser } = user;
      
      res.status(200).json(safeUser);
    } catch (error) {
      console.error("Firebase auth error:", error);
      res.status(500).json({ message: "Server error during authentication" });
    }
  });

  // Get user profile
  app.get("/api/profile", async (req, res) => {
    const userId = req.query.id;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
      // Check if it's a numeric ID or Firebase UID
      let user;
      const numericId = parseInt(userId, 10);
      
      if (!isNaN(numericId)) {
        user = await storage.getUser(numericId);
      } else {
        user = await storage.getUserByFirebaseUid(userId);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information before sending response
      const { password: _, ...safeUser } = user;
      
      res.status(200).json(safeUser);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Server error fetching profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
