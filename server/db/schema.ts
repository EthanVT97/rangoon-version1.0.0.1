import { pgTable, text, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core";

export const stagingErpnextImports = pgTable("staging_erpnext_imports", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  module: text("module").notNull(),
  recordCount: integer("record_count").notNull(),
  parsedData: jsonb("parsed_data").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const apiLogs = pgTable("api_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  stagingId: uuid("staging_id"), // ✓ Fixed: This now correctly maps to staging_id column
  filename: text("filename").notNull(),
  module: text("module").notNull(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  recordCount: integer("record_count").notNull(),
  successCount: integer("success_count").notNull(),
  failureCount: integer("failure_count").notNull(),
  status: text("status").notNull(),
  erpnextResponse: jsonb("erpnext_response"),
  errors: jsonb("errors"),
  responseTime: integer("response_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const configuration = pgTable("configuration", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const excelTemplates = pgTable("excel_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  module: text("module").notNull().unique(),
  templateName: text("template_name").notNull(),
  columns: jsonb("columns").notNull(),
  sampleData: jsonb("sample_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
