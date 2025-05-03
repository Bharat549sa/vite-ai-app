import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  firebaseUid: text("firebase_uid").unique(),
  lastLogin: timestamp("last_login"),
  // Membership details
  membershipType: text("membership_type").default("free"),
  membershipExpiry: timestamp("membership_expiry"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Fitness tracking integration
  fitbitToken: text("fitbit_token"),
  lastSyncedFitness: timestamp("last_synced_fitness"),
});

export const fitnessGoals = pgTable("fitness_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'cardio', 'strength', 'yoga', etc.
  targetValue: real("target_value").notNull(), // e.g., 10000 steps, 60 minutes, etc.
  unit: text("unit").notNull(), // 'steps', 'minutes', 'reps', etc.
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly'
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fitnessEntries = pgTable("fitness_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  goalId: integer("goal_id").references(() => fitnessGoals.id),
  entryDate: date("entry_date").notNull(),
  category: text("category").notNull(),
  activity: text("activity").notNull(), // 'running', 'yoga', 'weight lifting', etc.
  duration: integer("duration").notNull(), // in minutes
  value: real("value"), // can be steps, calories, weight, etc.
  unit: text("unit"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  exercises: jsonb("exercises").notNull(), // Array of exercise objects
  duration: integer("duration").notNull(), // in minutes
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  photoURL: true,
  firebaseUid: true,
  membershipType: true,
  membershipExpiry: true,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const firebaseUserSchema = z.object({
  uid: z.string(),
  displayName: z.string().nullable(),
  email: z.string().email().nullable(),
  photoURL: z.string().nullable(),
});

// Fitness goal schemas
export const insertFitnessGoalSchema = createInsertSchema(fitnessGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFitnessEntrySchema = createInsertSchema(fitnessEntries).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Subscription and membership schemas
export const subscriptionSchema = z.object({
  planType: z.enum(["monthly", "yearly"]),
  planPrice: z.number(),
});

export const membershipInfoSchema = z.object({
  membershipType: z.enum(["free", "pro"]).default("free"),
  membershipExpiry: z.date().nullable(),
  benefits: z.array(z.string()).optional(),
});

// Export all types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type FirebaseUser = z.infer<typeof firebaseUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type FitnessGoal = typeof fitnessGoals.$inferSelect;
export type InsertFitnessGoal = z.infer<typeof insertFitnessGoalSchema>;
export type FitnessEntry = typeof fitnessEntries.$inferSelect;
export type InsertFitnessEntry = z.infer<typeof insertFitnessEntrySchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type SubscriptionPlan = z.infer<typeof subscriptionSchema>;
export type MembershipInfo = z.infer<typeof membershipInfoSchema>;
