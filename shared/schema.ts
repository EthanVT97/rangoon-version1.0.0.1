import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Staging table for parsed Excel data before ERPNext import
export const stagingErpnextImports = pgTable("staging_erpnext_imports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  module: text("module").notNull(), // 'Item', 'Customer', 'Sales Order', 'Sales Invoice', 'Payment Entry'
  recordCount: integer("record_count").notNull(),
  parsedData: jsonb("parsed_data").notNull(), // Array of JSON objects from Excel
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Logging table for API responses and errors
export const apiLogs = pgTable("api_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stagingId: varchar("staging_id").references(() => stagingErpnextImports.id),
  filename: text("filename").notNull(),
  module: text("module").notNull(),
  endpoint: text("endpoint").notNull(), // ERPNext API endpoint
  method: text("method").notNull(), // GET, POST, PUT
  recordCount: integer("record_count"),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  status: text("status").notNull(), // 'success', 'failed', 'processing'
  erpnextResponse: jsonb("erpnext_response"), // API response from ERPNext
  errors: jsonb("errors"), // Array of error objects with row/column details
  responseTime: integer("response_time"), // Response time in ms
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Configuration table
export const configuration = pgTable("configuration", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Templates for Excel downloads
export const excelTemplates = pgTable("excel_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  module: text("module").notNull().unique(), // 'Item', 'Customer', etc.
  templateName: text("template_name").notNull(),
  columns: jsonb("columns").notNull(), // Array of column definitions
  sampleData: jsonb("sample_data"), // Optional sample rows
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertStagingImportSchema = createInsertSchema(stagingErpnextImports).omit({
  id: true,
  createdAt: true,
});

export const insertApiLogSchema = createInsertSchema(apiLogs).omit({
  id: true,
  timestamp: true,
});

export const insertConfigurationSchema = createInsertSchema(configuration).omit({
  id: true,
  updatedAt: true,
});

export const insertExcelTemplateSchema = createInsertSchema(excelTemplates).omit({
  id: true,
  createdAt: true,
});

// Types
export type StagingImport = typeof stagingErpnextImports.$inferSelect;
export type InsertStagingImport = z.infer<typeof insertStagingImportSchema>;

export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = z.infer<typeof insertApiLogSchema>;

export type Configuration = typeof configuration.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;

export type ExcelTemplate = typeof excelTemplates.$inferSelect;
export type InsertExcelTemplate = z.infer<typeof insertExcelTemplateSchema>;
