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

// Search history and saved searches
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  query: text("query").notNull(),
  filters: jsonb("filters"),
  resultCount: integer("result_count").default(0),
  executionTime: integer("execution_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("search_history_user_id_idx").on(table.userId),
  createdAtIdx: index("search_history_created_at_idx").on(table.createdAt),
  queryIdx: index("search_history_query_idx").on(table.query),
}));

export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  query: text("query").notNull(),
  filters: jsonb("filters"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("saved_searches_user_id_idx").on(table.userId),
  nameIdx: index("saved_searches_name_idx").on(table.name),
  isPublicIdx: index("saved_searches_public_idx").on(table.isPublic),
}));

// AI analysis and insights
export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  patternId: integer("pattern_id").references(() => codePatterns.id),
  analysisType: varchar("analysis_type").notNull(), // 'semantic_similarity', 'refactoring_suggestion', 'complexity_analysis'
  aiProvider: varchar("ai_provider").default("openai"), // 'openai', 'claude', 'local'
  prompt: text("prompt"),
  response: text("response"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0.00 to 100.00
  metadata: jsonb("metadata"), // additional context and parameters
  processingTime: integer("processing_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("ai_analysis_user_id_idx").on(table.userId),
  projectIdIdx: index("ai_analysis_project_id_idx").on(table.projectId),
  analysisTypeIdx: index("ai_analysis_type_idx").on(table.analysisType),
  createdAtIdx: index("ai_analysis_created_at_idx").on(table.createdAt),
  confidenceIdx: index("ai_analysis_confidence_idx").on(table.confidence),
}));

// Code quality metrics
export const codeMetrics = pgTable("code_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").notNull().references(() => projects.id),
  filePath: varchar("file_path").notNull(),
  complexity: integer("complexity"), // cyclomatic complexity
  linesOfCode: integer("lines_of_code"),
  maintainabilityIndex: decimal("maintainability_index", { precision: 5, scale: 2 }),
  technicalDebt: integer("technical_debt"), // in minutes
  codeSmells: jsonb("code_smells"), // array of detected issues
  securityIssues: jsonb("security_issues"), // array of security concerns
  performance: jsonb("performance"), // performance metrics
  lastAnalyzed: timestamp("last_analyzed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("code_metrics_user_id_idx").on(table.userId),
  projectIdIdx: index("code_metrics_project_id_idx").on(table.projectId),
  complexityIdx: index("code_metrics_complexity_idx").on(table.complexity),
  maintainabilityIdx: index("code_metrics_maintainability_idx").on(table.maintainabilityIndex),
  lastAnalyzedIdx: index("code_metrics_analyzed_idx").on(table.lastAnalyzed),
}));

// Refactoring suggestions
export const refactoringSuggestions = pgTable("refactoring_suggestions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  duplicateGroupId: integer("duplicate_group_id").references(() => duplicateGroups.id),
  suggestionsType: varchar("suggestion_type").notNull(), // 'extract_function', 'create_module', 'template'
  title: varchar("title").notNull(),
  description: text("description"),
  beforeCode: text("before_code"),
  afterCode: text("after_code"),
  estimatedEffort: varchar("estimated_effort"), // 'low', 'medium', 'high'
  potentialSavings: integer("potential_savings"), // estimated time saved in minutes
  status: varchar("status").default("pending"), // 'pending', 'applied', 'dismissed'
  priority: integer("priority").default(1), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
  appliedAt: timestamp("applied_at"),
}, (table) => ({
  userIdIdx: index("refactoring_suggestions_user_id_idx").on(table.userId),
  duplicateGroupIdx: index("refactoring_suggestions_group_idx").on(table.duplicateGroupId),
  statusIdx: index("refactoring_suggestions_status_idx").on(table.status),
  priorityIdx: index("refactoring_suggestions_priority_idx").on(table.priority),
  createdAtIdx: index("refactoring_suggestions_created_at_idx").on(table.createdAt),
}));

// Team collaboration features
export const teamInvitations = pgTable("team_invitations", {
  id: serial("id").primaryKey(),
  inviterId: varchar("inviter_id").notNull().references(() => users.id),
  inviteeEmail: varchar("invitee_email").notNull(),
  role: varchar("role").default("viewer"), // 'admin', 'editor', 'viewer'
  status: varchar("status").default("pending"), // 'pending', 'accepted', 'declined', 'expired'
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
}, (table) => ({
  inviterIdx: index("team_invitations_inviter_idx").on(table.inviterId),
  emailIdx: index("team_invitations_email_idx").on(table.inviteeEmail),
  statusIdx: index("team_invitations_status_idx").on(table.status),
  tokenIdx: index("team_invitations_token_idx").on(table.token),
}));

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: varchar("team_id").notNull(), // This could reference a teams table if needed
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default("viewer"),
  permissions: jsonb("permissions"), // detailed permission settings
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActive: timestamp("last_active"),
}, (table) => ({
  teamIdIdx: index("team_members_team_id_idx").on(table.teamId),
  userIdIdx: index("team_members_user_id_idx").on(table.userId),
  roleIdx: index("team_members_role_idx").on(table.role),
  teamUserIdx: index("team_members_team_user_idx").on(table.teamId, table.userId),
}));

// Activity and audit log
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // 'analyze_project', 'view_duplicate', 'apply_suggestion'
  resourceType: varchar("resource_type"), // 'project', 'duplicate_group', 'pattern'
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata"), // additional context
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("activity_log_user_id_idx").on(table.userId),
  actionIdx: index("activity_log_action_idx").on(table.action),
  resourceIdx: index("activity_log_resource_idx").on(table.resourceType, table.resourceId),
  createdAtIdx: index("activity_log_created_at_idx").on(table.createdAt),
}));

// Export new types
export type InsertSearchHistory = typeof searchHistory.$inferInsert;
export type SearchHistory = typeof searchHistory.$inferSelect;

export type InsertSavedSearch = typeof savedSearches.$inferInsert;
export type SavedSearch = typeof savedSearches.$inferSelect;

export type InsertAIAnalysis = typeof aiAnalysis.$inferInsert;
export type AIAnalysis = typeof aiAnalysis.$inferSelect;

export type InsertCodeMetrics = typeof codeMetrics.$inferInsert;
export type CodeMetrics = typeof codeMetrics.$inferSelect;

export type InsertRefactoringSuggestion = typeof refactoringSuggestions.$inferInsert;
export type RefactoringSuggestion = typeof refactoringSuggestions.$inferSelect;

export type InsertActivityLog = typeof activityLog.$inferInsert;
export type ActivityLog = typeof activityLog.$inferSelect;
