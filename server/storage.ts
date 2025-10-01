import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { stagingErpnextImports, apiLogs, configuration, excelTemplates } from "./db/schema.js";
import { eq, desc, count } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(connectionString);
const db = drizzle(sql);

export interface StagingImport {
  id: string;
  filename: string;
  module: string;
  recordCount: number;
  parsedData: Record<string, any>[];
  status: string;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface ApiLog {
  id: string;
  stagingId?: string | null;
  filename: string;
  module: string;
  endpoint: string;
  method: string;
  recordCount: number;
  successCount: number;
  failureCount: number;
  status: string;
  erpnextResponse?: any;
  errors?: any;
  responseTime: number;
  createdAt: Date;
}

export interface Template {
  id: string;
  module: string;
  templateName: string;
  columns: string[];
  sampleData?: Record<string, any>[];
  createdAt: Date;
  updatedAt: Date;
}

class Storage {
  async createStagingImport(data: {
    filename: string;
    module: string;
    recordCount: number;
    parsedData: Record<string, any>[];
    status: string;
  }): Promise<StagingImport> {
    const result = await db.insert(stagingErpnextImports).values(data).returning();
    return result[0] as StagingImport;
  }

  async getStagingImport(id: string): Promise<StagingImport | null> {
    const result = await db.select().from(stagingErpnextImports).where(eq(stagingErpnextImports.id, id));
    return result[0] as StagingImport || null;
  }

  async updateStagingImportStatus(id: string, status: string, completedAt?: Date): Promise<void> {
    await db.update(stagingErpnextImports)
      .set({ status, completedAt })
      .where(eq(stagingErpnextImports.id, id));
  }

  async createApiLog(data: {
    stagingId?: string;
    filename: string;
    module: string;
    endpoint: string;
    method: string;
    recordCount: number;
    successCount: number;
    failureCount: number;
    status: string;
    erpnextResponse?: any;
    errors?: any;
    responseTime: number;
  }): Promise<ApiLog> {
    const result = await db.insert(apiLogs).values(data).returning();
    return result[0] as ApiLog;
  }

  async getApiLogs(limit: number = 50): Promise<ApiLog[]> {
    const result = await db.select().from(apiLogs)
      .orderBy(desc(apiLogs.createdAt))
      .limit(limit);
    return result as ApiLog[];
  }

  async getApiLogsByStatus(status: string): Promise<ApiLog[]> {
    const result = await db.select().from(apiLogs)
      .where(eq(apiLogs.status, status))
      .orderBy(desc(apiLogs.createdAt));
    return result as ApiLog[];
  }

  async getTemplate(module: string): Promise<Template | null> {
    const result = await db.select().from(excelTemplates).where(eq(excelTemplates.module, module));
    return result[0] as Template || null;
  }

  async createTemplate(data: {
    module: string;
    templateName: string;
    columns: string[];
    sampleData?: Record<string, any>[];
  }): Promise<Template> {
    const result = await db.insert(excelTemplates).values(data).returning();
    return result[0] as Template;
  }

  async getConfiguration(key: string): Promise<string | null> {
    const result = await db.select().from(configuration).where(eq(configuration.key, key));
    return result[0]?.value || null;
  }

  async setConfiguration(key: string, value: string, description?: string): Promise<void> {
    await db.insert(configuration)
      .values({ key, value, description })
      .onConflictDoUpdate({
        target: configuration.key,
        set: { value, updatedAt: new Date() }
      });
  }
}

export const storage = new Storage();
