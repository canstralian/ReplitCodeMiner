import { pgTable, text, integer, timestamp, varchar, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  language: text("language"),
  url: text("url").notNull(),
  fileCount: integer("file_count").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const codePatterns = pgTable("code_patterns", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").notNull().references(() => projects.id),
  filePath: text("file_path").notNull(),
  patternHash: text("pattern_hash").notNull(),
  codeSnippet: text("code_snippet").notNull(),
  patternType: text("pattern_type").notNull(),
  lineStart: integer("line_start").notNull(),
  lineEnd: integer("line_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const duplicateGroups = pgTable("duplicate_groups", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("user_id").notNull().references(() => users.id),
  patternHash: text("pattern_hash").notNull(),
  similarityScore: decimal("similarity_score", { precision: 5, scale: 4 }),
  patternType: text("pattern_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patternGroups = pgTable("pattern_groups", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  duplicateGroupId: integer("duplicate_group_id").notNull().references(() => duplicateGroups.id),
  codePatternId: integer("code_pattern_id").notNull().references(() => codePatterns.id),
});

// Sessions table for express-session
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Enhanced Zod schemas with validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  profileImageUrl: z.string().url().optional()
});

export const selectUserSchema = createSelectSchema(users);

export const insertProjectSchema = createInsertSchema(projects, {
  title: z.string().min(1, "Project title is required").max(200),
  description: z.string().max(1000).optional(),
  language: z.string().max(50).optional(),
  url: z.string().url("Invalid project URL"),
  fileCount: z.number().int().min(0).optional()
});

export const selectProjectSchema = createSelectSchema(projects);

export const insertCodePatternSchema = createInsertSchema(codePatterns, {
  filePath: z.string().min(1, "File path is required"),
  patternHash: z.string().min(1, "Pattern hash is required"),
  codeSnippet: z.string().min(1, "Code snippet is required"),
  patternType: z.enum(['function', 'class', 'import', 'component', 'hook', 'api_call']),
  lineStart: z.number().int().min(1),
  lineEnd: z.number().int().min(1)
});

export const insertDuplicateGroupSchema = createInsertSchema(duplicateGroups, {
  patternHash: z.string().min(1, "Pattern hash is required"),
  similarityScore: z.string().regex(/^\d+\.\d{4}$/, "Invalid similarity score format"),
  patternType: z.enum(['function', 'class', 'import', 'component', 'hook', 'api_call'])
});

// API request/response schemas
export const analyzeProjectsRequestSchema = z.object({
  projectIds: z.array(z.string().uuid("Invalid project ID format")).min(1).max(50)
});

export const searchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  language: z.string().max(50).optional(),
  patternType: z.enum(['function', 'class', 'import', 'component', 'hook', 'api_call']).optional()
});

export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('dark'),
  analysisThreshold: z.number().min(0.1).max(1.0).default(0.8),
  autoRefresh: z.boolean().default(false),
  notifications: z.boolean().default(true),
  maxFileSize: z.number().int().min(1024).max(10485760).default(1048576) // 1MB default
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type CodePattern = typeof codePatterns.$inferSelect;
export type InsertCodePattern = typeof codePatterns.$inferInsert;
export type DuplicateGroup = typeof duplicateGroups.$inferSelect;
export type InsertDuplicateGroup = typeof duplicateGroups.$inferInsert;