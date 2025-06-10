import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table to cache Replit project data
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  replitId: varchar("replit_id").notNull(),
  title: varchar("title").notNull(),
  url: varchar("url").notNull(),
  language: varchar("language"),
  description: text("description"),
  fileCount: integer("file_count").default(0),
  lastUpdated: timestamp("last_updated"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Code patterns and duplicates detection results
export const codePatterns = pgTable("code_patterns", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").notNull().references(() => projects.id),
  filePath: varchar("file_path").notNull(),
  patternHash: varchar("pattern_hash").notNull(),
  codeSnippet: text("code_snippet"),
  patternType: varchar("pattern_type"), // 'function', 'component', 'style', etc.
  lineStart: integer("line_start"),
  lineEnd: integer("line_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Duplicate groups for similar code patterns
export const duplicateGroups = pgTable("duplicate_groups", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  groupHash: varchar("group_hash").notNull(),
  similarityScore: integer("similarity_score"), // 0-100
  patternType: varchar("pattern_type"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Link patterns to duplicate groups
export const patternGroups = pgTable("pattern_groups", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => duplicateGroups.id),
  patternId: integer("pattern_id").notNull().references(() => codePatterns.id),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertProject = typeof projects.$inferInsert;
export type Project = typeof projects.$inferSelect;

export type InsertCodePattern = typeof codePatterns.$inferInsert;
export type CodePattern = typeof codePatterns.$inferSelect;

export type InsertDuplicateGroup = typeof duplicateGroups.$inferInsert;
export type DuplicateGroup = typeof duplicateGroups.$inferSelect;

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCodePatternSchema = createInsertSchema(codePatterns).omit({
  id: true,
  createdAt: true,
});

export const insertDuplicateGroupSchema = createInsertSchema(duplicateGroups).omit({
  id: true,
  createdAt: true,
});
