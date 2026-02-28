import { pgTable, text, integer, timestamp, boolean, doublePrecision } from 'drizzle-orm/pg-core';

// ───────────────── USERS (Citizens & Politicians) ───────────────── //

export const users = pgTable('users', {
  id: text('id').primaryKey(), // We will use the Clerk user ID directly
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['citizen', 'politician', 'admin', 'moderator'] }).notNull().default('citizen'),
  avatar: text('avatar'),

  // Citizen specific fields
  reputationScore: integer('reputation_score').default(0),
  
  // Politician specific fields
  district: text('district'),
  transparencyScore: integer('transparency_score').default(0),
  avgResponseTimeHours: doublePrecision('avg_response_time_hours').default(0),
  resolutionRate: integer('resolution_rate').default(0),
  citizenRating: doublePrecision('citizen_rating').default(0.0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ───────────────── ISSUES (Reports & Petitions) ───────────────── //

export const issues = pgTable('issues', {
  id: text('id').primaryKey(), // Generated ID like 'ISS-1234'
  title: text('title').notNull(),
  description: text('description').notNull(),
  reporterId: text('reporter_id').references(() => users.id).notNull(),
  assignedPoliticianId: text('assigned_politician_id').references(() => users.id),
  
  category: text('category', { enum: ['Infrastructure', 'Sanitation', 'Safety', 'General'] }).notNull(),
  aiCategoryConfidence: integer('ai_category_confidence'),
  
  priority: text('priority', { enum: ['Low', 'Medium', 'High', 'Critical'] }).notNull().default('Medium'),
  status: text('status', { enum: ['Pending', 'In Progress', 'Resolved', 'Escalated'] }).notNull().default('Pending'),
  
  location: text('location').notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  
  slaDeadline: timestamp('sla_deadline').notNull(),
  escalationLevel: text('escalation_level', { enum: ['Normal', 'Level 1', 'Level 2', 'Critical'] }).notNull().default('Normal'),
  
  isPetition: boolean('is_petition').notNull().default(false),
  upvotes: integer('upvotes').notNull().default(0),
  petitionTarget: integer('petition_target'),
  commentsCount: integer('comments_count').notNull().default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ───────────────── NOTIFICATIONS ───────────────── //

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  type: text('type', { enum: ['SLA_WARNING', 'ESCALATION', 'REPLY', 'STATUS_CHANGE', 'PETITION_MILESTONE'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  linkToIssueId: text('link_to_issue_id').references(() => issues.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
