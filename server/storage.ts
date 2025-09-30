import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import {
  stagingErpnextImports,
  apiLogs,
  configuration,
  excelTemplates,
  type StagingImport,
  type InsertStagingImport,
  type ApiLog,
  type InsertApiLog,
  type Configuration,
  type InsertConfiguration,
  type ExcelTemplate,
  type InsertExcelTemplate,
} from "@shared/schema";

export interface IStorage {
  // Staging imports
  createStagingImport(data: InsertStagingImport): Promise<StagingImport>;
  getStagingImport(id: string): Promise<StagingImport | undefined>;
  updateStagingImportStatus(id: string, status: string, processedAt?: Date): Promise<void>;
  getPendingStagingImports(): Promise<StagingImport[]>;

  // API logs
  createApiLog(data: InsertApiLog): Promise<ApiLog>;
  getApiLogs(limit?: number): Promise<ApiLog[]>;
  getApiLogsByStatus(status: string): Promise<ApiLog[]>;
  getApiLogsByStagingId(stagingId: string): Promise<ApiLog[]>;

  // Configuration
  getConfig(key: string): Promise<Configuration | undefined>;
  setConfig(data: InsertConfiguration): Promise<Configuration>;

  // Excel templates
  getTemplate(module: string): Promise<ExcelTemplate | undefined>;
  getAllTemplates(): Promise<ExcelTemplate[]>;
  createTemplate(data: InsertExcelTemplate): Promise<ExcelTemplate>;
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async createStagingImport(data: InsertStagingImport): Promise<StagingImport> {
    const [result] = await this.db.insert(stagingErpnextImports).values(data).returning();
    return result;
  }

  async getStagingImport(id: string): Promise<StagingImport | undefined> {
    const [result] = await this.db
      .select()
      .from(stagingErpnextImports)
      .where(eq(stagingErpnextImports.id, id));
    return result;
  }

  async updateStagingImportStatus(id: string, status: string, processedAt?: Date): Promise<void> {
    await this.db
      .update(stagingErpnextImports)
      .set({ status, processedAt: processedAt || new Date() })
      .where(eq(stagingErpnextImports.id, id));
  }

  async getPendingStagingImports(): Promise<StagingImport[]> {
    return await this.db
      .select()
      .from(stagingErpnextImports)
      .where(eq(stagingErpnextImports.status, "pending"))
      .orderBy(stagingErpnextImports.createdAt);
  }

  async createApiLog(data: InsertApiLog): Promise<ApiLog> {
    const [result] = await this.db.insert(apiLogs).values(data).returning();
    return result;
  }

  async getApiLogs(limit: number = 50): Promise<ApiLog[]> {
    return await this.db
      .select()
      .from(apiLogs)
      .orderBy(desc(apiLogs.timestamp))
      .limit(limit);
  }

  async getApiLogsByStatus(status: string): Promise<ApiLog[]> {
    return await this.db
      .select()
      .from(apiLogs)
      .where(eq(apiLogs.status, status))
      .orderBy(desc(apiLogs.timestamp));
  }

  async getApiLogsByStagingId(stagingId: string): Promise<ApiLog[]> {
    return await this.db
      .select()
      .from(apiLogs)
      .where(eq(apiLogs.stagingId, stagingId))
      .orderBy(apiLogs.timestamp);
  }

  async getConfig(key: string): Promise<Configuration | undefined> {
    const [result] = await this.db
      .select()
      .from(configuration)
      .where(eq(configuration.key, key));
    return result;
  }

  async setConfig(data: InsertConfiguration): Promise<Configuration> {
    const existing = await this.getConfig(data.key);
    if (existing) {
      const [result] = await this.db
        .update(configuration)
        .set({ value: data.value, updatedAt: new Date() })
        .where(eq(configuration.key, data.key))
        .returning();
      return result;
    } else {
      const [result] = await this.db.insert(configuration).values(data).returning();
      return result;
    }
  }

  async getTemplate(module: string): Promise<ExcelTemplate | undefined> {
    const [result] = await this.db
      .select()
      .from(excelTemplates)
      .where(eq(excelTemplates.module, module));
    return result;
  }

  async getAllTemplates(): Promise<ExcelTemplate[]> {
    return await this.db.select().from(excelTemplates);
  }

  async createTemplate(data: InsertExcelTemplate): Promise<ExcelTemplate> {
    const [result] = await this.db.insert(excelTemplates).values(data).returning();
    return result;
  }
}

export const storage = new DbStorage();
