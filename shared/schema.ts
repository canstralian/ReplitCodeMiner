import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal
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
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("trial"), // trial, active, canceled, expired
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, enterprise
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  projectAnalysisLimit: integer("project_analysis_limit").default(5), // free tier limit
  monthlyAnalysisCount: integer("monthly_analysis_count").default(0),
  lastBillingReset: timestamp("last_billing_reset").defaultNow(),
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
}, (table) => ({
  userIdIdx: index("projects_user_id_idx").on(table.userId),
  replitIdIdx: index("projects_replit_id_idx").on(table.replitId),
  languageIdx: index("projects_language_idx").on(table.language),
  userReplitIdx: index("projects_user_replit_idx").on(table.userId, table.replitId),
  lastUpdatedIdx: index("projects_last_updated_idx").on(table.lastUpdated),
}));

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
}, (table) => ({
  userIdIdx: index("code_patterns_user_id_idx").on(table.userId),
  projectIdIdx: index("code_patterns_project_id_idx").on(table.projectId),
  patternHashIdx: index("code_patterns_hash_idx").on(table.patternHash),
  patternTypeIdx: index("code_patterns_type_idx").on(table.patternType),
  userProjectIdx: index("code_patterns_user_project_idx").on(table.userId, table.projectId),
  createdAtIdx: index("code_patterns_created_at_idx").on(table.createdAt),
}));

// Duplicate groups for similar code patterns
export const duplicateGroups = pgTable("duplicate_groups", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  groupHash: varchar("group_hash").notNull(),
  similarityScore: integer("similarity_score"), // 0-100
  patternType: varchar("pattern_type"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("duplicate_groups_user_id_idx").on(table.userId),
  groupHashIdx: index("duplicate_groups_hash_idx").on(table.groupHash),
  patternTypeIdx: index("duplicate_groups_type_idx").on(table.patternType),
  createdAtIdx: index("duplicate_groups_created_at_idx").on(table.createdAt),
}));

// Link patterns to duplicate groups
export const patternGroups = pgTable("pattern_groups", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => duplicateGroups.id),
  patternId: integer("pattern_id").notNull().references(() => codePatterns.id),
}, (table) => ({
  groupIdIdx: index("pattern_groups_group_id_idx").on(table.groupId),
  patternIdIdx: index("pattern_groups_pattern_id_idx").on(table.patternId),
  groupPatternIdx: index("pattern_groups_group_pattern_idx").on(table.groupId, table.patternId),
}));

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
