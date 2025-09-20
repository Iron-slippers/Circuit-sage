import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Electronics formulas table
export const formulas = pgTable("formulas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  formula: text("formula").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  variables: text("variables").array(),
});

// Electronics constants table  
export const constants = pgTable("constants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  description: text("description"),
});

// Calculation results for history
export const calculations = pgTable("calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formulaId: varchar("formula_id").notNull(),
  inputs: text("inputs").notNull(), // JSON string of input values
  result: real("result").notNull(),
  timestamp: varchar("timestamp").notNull(),
});

export const insertFormulaSchema = createInsertSchema(formulas).omit({
  id: true,
});

export const insertConstantSchema = createInsertSchema(constants).omit({
  id: true,
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
});

export type InsertFormula = z.infer<typeof insertFormulaSchema>;
export type Formula = typeof formulas.$inferSelect;

export type InsertConstant = z.infer<typeof insertConstantSchema>;
export type Constant = typeof constants.$inferSelect;

export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculations.$inferSelect;
