import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Staging table for parsed Excel data before ERPNext import
export const stagingErpnextImports = pgTable("staging_erpnext_imports", {
  id: uuid("id").primaryKey().defaultRandom(), // Using uuid and defaultRandom()
  filename: text("filename").notNull(),
  module: text("module").notNull(), // 'Item', 'Customer', 'Sales Order', 'Sales Invoice', 'Payment Entry'
  recordCount: integer("record_count").notNull(),
  parsedData: jsonb("parsed_data").notNull(), // Array of JSON objects from Excel
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(), // Consistent default and notNull order
  completedAt: timestamp("completed_at"), // Standardized from processedAt
});

// Logging table for API responses and errors
export const apiLogs = pgTable("api_logs", {
  id: uuid("id").primaryKey().defaultRandom(), // Using uuid and defaultRandom()
  stagingId: uuid("staging_id").references(() => stagingErpnextImports.id), // Using uuid
  filename: text("filename").notNull(),
  module: text("module").notNull(),
  endpoint: text("endpoint").notNull(), // ERPNext API endpoint
  method: text("method").notNull(), // GET, POST, PUT, etc.
  recordCount: integer("record_count").notNull(),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  status: text("status").notNull(), // 'success', 'failed', 'processing'
  erpnextResponse: jsonb("erpnext_response"), // API response from ERPNext
  errors: jsonb("errors"), // Array of error objects with row/column details
  responseTime: integer("response_time").notNull(), // Response time in ms
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Configuration table
export const configuration = pgTable("configuration", {
  id: uuid("id").primaryKey().defaultRandom(), // Using uuid and defaultRandom()
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(), // Consistent default and notNull order
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Templates for Excel downloads
export const excelTemplates = pgTable("excel_templates", {
  id: uuid("id").primaryKey().defaultRandom(), // Using uuid and defaultRandom()
  module: text("module").notNull().unique(), // 'Item', 'Customer', etc.
  templateName: text("template_name").notNull(),
  columns: jsonb("columns").notNull(), // Array of column definitions
  sampleData: jsonb("sample_data"), // Optional sample rows
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas - omitting auto-generated fields for inserts
export const insertStagingImportSchema = createInsertSchema(stagingErpnextImports).omit({
  id: true,
  createdAt: true, // Omit createdAt for inserts if defaultNow
});

export const insertApiLogSchema = createInsertSchema(apiLogs).omit({
  id: true,
  createdAt: true, // Omit createdAt for inserts if defaultNow
});

export const insertConfigurationSchema = createInsertSchema(configuration).omit({
  id: true,
  createdAt: true, // Omit createdAt for inserts if defaultNow
  updatedAt: true, // Omit updatedAt for inserts if defaultNow
});

export const insertExcelTemplateSchema = createInsertSchema(excelTemplates).omit({
  id: true,
  createdAt: true, // Omit createdAt for inserts if defaultNow
  updatedAt: true, // Omit updatedAt for inserts if defaultNow
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
