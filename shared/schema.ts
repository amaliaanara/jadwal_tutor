import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  pgEnum,
  boolean,
  decimal,
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

// User role enum
export const userRoleEnum = pgEnum("user_role", ["admin", "teacher"]);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("teacher"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning packages
export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  hours: integer("hours").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student level enum
export const studentLevelEnum = pgEnum("student_level", ["beginner", "intermediate", "advanced"]);

// Students
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email").unique(),
  age: integer("age"),
  level: studentLevelEnum("level").default("beginner"),
  packageId: varchar("package_id").references(() => packages.id),
  assignedTeacherId: varchar("assigned_teacher_id").references(() => users.id),
  remainingHours: decimal("remaining_hours", { precision: 5, scale: 2 }).default("0"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Class status enum
export const classStatusEnum = pgEnum("class_status", ["scheduled", "ongoing", "completed", "cancelled", "rescheduled"]);

// Request status enum
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected"]);

// Classes/Schedule
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  teacherId: varchar("teacher_id").references(() => users.id).notNull(),
  subject: varchar("subject", { length: 100 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: decimal("duration", { precision: 3, scale: 2 }).default("1.0"), // in hours
  zoomLink: text("zoom_link"),
  status: classStatusEnum("status").default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schedule change requests
export const scheduleChangeRequests = pgTable("schedule_change_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").references(() => classes.id).notNull(),
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  oldStartTime: timestamp("old_start_time").notNull(),
  oldEndTime: timestamp("old_end_time").notNull(),
  newStartTime: timestamp("new_start_time").notNull(),
  newEndTime: timestamp("new_end_time").notNull(),
  reason: text("reason"),
  status: requestStatusEnum("status").default("pending"),
  teacherResponse: text("teacher_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  classes: many(classes),
  scheduleChangeRequests: many(scheduleChangeRequests),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  package: one(packages, {
    fields: [students.packageId],
    references: [packages.id],
  }),
  assignedTeacher: one(users, {
    fields: [students.assignedTeacherId],
    references: [users.id],
  }),
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  student: one(students, {
    fields: [classes.studentId],
    references: [students.id],
  }),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  scheduleChangeRequests: many(scheduleChangeRequests),
}));

export const scheduleChangeRequestsRelations = relations(scheduleChangeRequests, ({ one }) => ({
  class: one(classes, {
    fields: [scheduleChangeRequests.classId],
    references: [classes.id],
  }),
  requestedByUser: one(users, {
    fields: [scheduleChangeRequests.requestedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleChangeRequestSchema = createInsertSchema(scheduleChangeRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type ScheduleChangeRequest = typeof scheduleChangeRequests.$inferSelect;
export type InsertScheduleChangeRequest = z.infer<typeof insertScheduleChangeRequestSchema>;

// Extended types with relations
export type StudentWithRelations = Student & {
  package?: Package;
  assignedTeacher?: User;
};

export type ClassWithRelations = Class & {
  student?: Student;
  teacher?: User;
};
