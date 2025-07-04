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

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type CodePattern = typeof codePatterns.$inferSelect;
export type InsertCodePattern = typeof codePatterns.$inferInsert;
export type DuplicateGroup = typeof duplicateGroups.$inferSelect;
export type InsertDuplicateGroup = typeof duplicateGroups.$inferInsert;