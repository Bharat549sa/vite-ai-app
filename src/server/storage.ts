import { 
    users, fitnessGoals, fitnessEntries, workoutPlans,
    type User, type InsertUser,
    type FitnessGoal, type InsertFitnessGoal,
    type FitnessEntry, type InsertFitnessEntry,
    type WorkoutPlan, type InsertWorkoutPlan
  } from "@shared/schema";
  
  // modify the interface with any CRUD methods
  // you might need
  // Define the types used in the interface
interface User {
  id: number;
  username: string;
  email: string;
  // Add other user properties as needed
}

interface InsertUser {
  username: string;
  email: string;
  // Add other properties needed for user creation
}

interface FitnessGoal {
  id: number;
  userId: number;
  // Add other fitness goal properties
}

interface InsertFitnessGoal {
  userId: number;
  // Add other properties needed for fitness goal creation
}
  export interface IStorage {
    // User management
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
    updateLastLogin(id: number): Promise<User | undefined>;
    
    // Membership and subscription
    updateUserMembership(userId: number, type: string, expiryDate: Date): Promise<User | undefined>;
    updateStripeInfo(userId: number, customerId: string, subscriptionId: string): Promise<User | undefined>;
    
    // Fitness goals
    getFitnessGoals(userId: number): Promise<FitnessGoal[]>;
    getFitnessGoal(id: number): Promise<FitnessGoal | undefined>;
    createFitnessGoal(goal: InsertFitnessGoal): Promise<FitnessGoal>;
    updateFitnessGoal(id: number, goal: Partial<InsertFitnessGoal>): Promise<FitnessGoal | undefined>;
    deleteFitnessGoal(id: number): Promise<boolean>;
    
    // Fitness entries
    getFitnessEntries(userId: number, filters?: {goalId?: number, startDate?: Date, endDate?: Date}): Promise<FitnessEntry[]>;
    createFitnessEntry(entry: InsertFitnessEntry): Promise<FitnessEntry>;
    updateFitnessEntry(id: number, entry: Partial<InsertFitnessEntry>): Promise<FitnessEntry | undefined>;
    deleteFitnessEntry(id: number): Promise<boolean>;
    
    // Workout plans
    getWorkoutPlans(userId: number): Promise<WorkoutPlan[]>;
    getPublicWorkoutPlans(): Promise<WorkoutPlan[]>;
    getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined>;
    createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
    updateWorkoutPlan(id: number, plan: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan | undefined>;
    deleteWorkoutPlan(id: number): Promise<boolean>;
  }
  
  export class MemStorage implements IStorage {
    private users: Map<number, User>;
    currentId: number;
  
    constructor() {
      this.users = new Map();
      this.currentId = 1;
    }
  
    async getUser(id: number): Promise<User | undefined> {
      return this.users.get(id);
    }
  
    async getUserByUsername(username: string): Promise<User | undefined> {
      return Array.from(this.users.values()).find(
        (user) => user.username === username,
      );
    }
  
    async getUserByEmail(email: string): Promise<User | undefined> {
      return Array.from(this.users.values()).find(
        (user) => user.email === email,
      );
    }
  
    async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
      return Array.from(this.users.values()).find(
        (user) => user.firebaseUid === firebaseUid,
      );
    }
  
    async createUser(insertUser: InsertUser): Promise<User> {
      const id = this.currentId++;
      const user: User = { 
        ...insertUser, 
        id, 
        lastLogin: insertUser.lastLogin || new Date() 
      };
      this.users.set(id, user);
      return user;
    }
  
    async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
      const existingUser = this.users.get(id);
      if (!existingUser) return undefined;
  
      const updatedUser: User = {
        ...existingUser,
        ...updateData,
      };
      
      this.users.set(id, updatedUser);
      return updatedUser;
    }
  
    async updateLastLogin(id: number): Promise<User | undefined> {
      const existingUser = this.users.get(id);
      if (!existingUser) return undefined;
  
      const updatedUser: User = {
        ...existingUser,
        lastLogin: new Date(),
      };
      
      this.users.set(id, updatedUser);
      return updatedUser;
    }
  }
  
  export const storage = new MemStorage();
  