import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core"; // Fixed: Changed varchar to uuid
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Staging table for parsed Excel data before ERPNext import
export const stagingErpnextImports = pgTable("staging_erpnext_imports", {
  id: uuid("id").primaryKey().defaultRandom(), // Fixed: Using uuid and defaultRandom()
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
  id: uuid("id").primaryKey().defaultRandom(), // Fixed: Using uuid and defaultRandom()
  stagingId: uuid("staging_id").references(() => stagingErpnextImports.id), // Fixed: Using uuid
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
  createdAt: timestamp("created_at").notNull().defaultNow(), // Fixed: Renamed to createdAt
});

// Configuration table
export const configuration = pgTable("configuration", {
  id: uuid("id").primaryKey().defaultRandom(), // Fixed: Using uuid and defaultRandom()
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"), // Added description as it's in storage.ts
  createdAt: timestamp("created_at").defaultNow().notNull(), // Added createdAt as it's common for audit
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Templates for Excel downloads
export const excelTemplates = pgTable("excel_templates", {
  id: uuid("id").primaryKey().defaultRandom(), // Fixed: Using uuid and defaultRandom()
  module: text("module").notNull().unique(), // 'Item', 'Customer', etc.
  templateName: text("template_name").notNull(),
  columns: jsonb("columns").notNull(), // Array of column definitions
  sampleData: jsonb("sample_data"), // Optional sample rows
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // Added updatedAt as it's in storage.ts
});

// Insert schemas
export const insertStagingImportSchema = createInsertSchema(stagingErpnextImports).omit({
  id: true,
  createdAt: true,
});

export const insertApiLogSchema = createInsertSchema(apiLogs).omit({
  id: true,
  createdAt: true, // Fixed: Omit createdAt
});

export const insertConfigurationSchema = createInsertSchema(configuration).omit({
  id: true,
  createdAt: true, // Omit createdAt for inserts if defaultNow
  updatedAt: true,
});

export const insertExcelTemplateSchema = createInsertSchema(excelTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
