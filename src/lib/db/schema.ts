import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

// userId is a nanoid generated client-side and stored in localStorage + cookie.
// No accounts required — progress persists per browser.

// ─── exam_sessions ────────────────────────────────────────────────────────────
export const examSessions = pgTable("exam_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // "practice" | "full" | "lab"
  score: integer("score"),
  totalQuestions: integer("total_questions").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  domainScores: jsonb("domain_scores"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── answers ──────────────────────────────────────────────────────────────────
export const answers = pgTable("answers", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => examSessions.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  domain: text("domain").notNull(),
  objective: text("objective").notNull(),
  selected: text("selected").notNull(),
  correct: boolean("correct").notNull(),
  timeMs: integer("time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── lab_attempts ─────────────────────────────────────────────────────────────
export const labAttempts = pgTable("lab_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  labId: text("lab_id").notNull(),
  labType: text("lab_type").notNull(), // "cli" | "topology"
  tasksJson: jsonb("tasks_json").notNull(),
  passedAll: boolean("passed_all").notNull().default(false),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// ─── card_states ──────────────────────────────────────────────────────────────
export const cardStates = pgTable(
  "card_states",
  {
    userId: text("user_id").notNull(),
    questionId: text("question_id").notNull(),
    easeFactor: real("ease_factor").notNull().default(2.5),
    interval: integer("interval").notNull().default(1),
    repetitions: integer("repetitions").notNull().default(0),
    nextReview: timestamp("next_review").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);

// ─── streaks ──────────────────────────────────────────────────────────────────
export const streaks = pgTable("streaks", {
  userId: text("user_id").primaryKey(),
  current: integer("current").notNull().default(0),
  longest: integer("longest").notNull().default(0),
  lastActive: timestamp("last_active").defaultNow().notNull(),
});

// ─── ai_usage ─────────────────────────────────────────────────────────────────
// Tracks per-user daily AI explanation usage. Date is YYYY-MM-DD string.
// Table is created lazily on first /api/explain call — no migration needed.
export const aiUsage = pgTable(
  "ai_usage",
  {
    userId: text("user_id").notNull(),
    date: text("date").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);
