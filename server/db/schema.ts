import { pgTable, text, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core";

export const stagingErpnextImports = pgTable("staging_erpnext_imports", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  module: text("module").notNull(), // 'Item', 'Customer', 'Sales Order', 'Sales Invoice', 'Payment Entry'
  recordCount: integer("record_count").notNull(),
  parsedData: jsonb("parsed_data").notNull(), // Array of JSON objects from Excel
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"), // Standardized from processedAt in shared/schema.ts
});

export const apiLogs = pgTable("api_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  stagingId: uuid("staging_id"),
  filename: text("filename").notNull(),
  module: text("module").notNull(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  recordCount: integer("record_count").notNull(), // Consistent with shared/schema.ts
  successCount: integer("success_count").notNull().default(0), // Consistent with shared/schema.ts
  failureCount: integer("failure_count").notNull().default(0), // Consistent with shared/schema.ts
  status: text("status").notNull(),
  erpnextResponse: jsonb("erpnext_response"),
  errors: jsonb("errors"),
  responseTime: integer("response_time").notNull(), // Consistent with shared/schema.ts
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const configuration = pgTable("configuration", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"), // Added description as it's in shared/schema.ts
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const excelTemplates = pgTable("excel_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  module: text("module").notNull().unique(),
  templateName: text("template_name").notNull(),
  columns: jsonb("columns").notNull(),
  sampleData: jsonb("sample_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // Consistent with shared/schema.ts
});
