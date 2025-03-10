import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  institutionName: text("institution_name").notNull(),
  type: text("type", { enum: ['school', 'coaching', 'college'] }).notNull(),
  planType: text("plan_type", { enum: ['basic', 'pro'] }).notNull(),
  planDuration: integer("plan_duration").notNull(), // in years
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  name: text("name").notNull(),
  rollNumber: text("roll_number").notNull(),
  class: text("class").notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status", { enum: ['present', 'absent'] }).notNull(),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  amount: integer("amount").notNull(),
  date: timestamp("date").notNull(),
  status: text("status", { enum: ['paid', 'pending'] }).notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  type: text("type", { enum: ['behavioral', 'academic'] }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  institutionName: true,
  type: true,
  planType: true,
  planDuration: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Fee = typeof fees.$inferSelect;
export type Report = typeof reports.$inferSelect;
