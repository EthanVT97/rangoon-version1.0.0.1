import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage.js";
import { excelParser } from "./services/excelParser.js";
import { dataValidator } from "./services/validator.js";
import { getERPNextClient } from "./services/erpnextClient.js";
import { autoFixMiddleware } from "./services/autoFixMiddleware.js";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { configuration, stagingErpnextImports, apiLogs, excelTemplates } from "./db/schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(connectionString);
const db = drizzle(sql);

export async function registerRoutes(app: Express): Promise<Server> {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.mimetype === "application/vnd.ms-excel") {
        cb(null, true);
      } else {
        cb(new Error("Only .xlsx and .xls files are allowed"));
      }
    },
  });

  app.post("/api/upload-excel", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { module } = req.body;
      if (!module) {
        return res.status(400).json({ message: "Module is required" });
      }

      const parsed = excelParser.parseFile(req.file.buffer);
      const validation = dataValidator.validate(module, parsed.data);

      if (!validation.isValid) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      const stagingImport = await storage.createStagingImport({
        filename: req.file.originalname,
        module,
        recordCount: parsed.rowCount,
        parsedData: parsed.data,
        status: "pending",
      });

      processImport(stagingImport.id, module, parsed.data).catch(console.error);

      res.json({
        message: "File uploaded successfully",
        stagingId: stagingImport.id,
        recordCount: parsed.rowCount,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/staging/:id", async (req, res) => {
    try {
      const stagingImport = await storage.getStagingImport(req.params.id);
      if (!stagingImport) {
        return res.status(404).json({ message: "Import not found" });
      }
      res.json(stagingImport);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/logs", async (req, res) => {
    try {
      const { status, limit } = req.query;
      let logs;

      if (status && typeof status === "string") {
        logs = await storage.getApiLogsByStatus(status);
      } else {
        logs = await storage.getApiLogs(limit ? Number(limit) : 50);
      }

      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/logs/all", async (req, res) => {
    try {
      const logs = await storage.getApiLogs(100);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/template/:module", async (req, res) => {
    try {
      const { module } = req.params;
      const template = await storage.getTemplate(module);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const buffer = excelParser.generateTemplate(
        module,
        template.columns as string[],
        template.sampleData as Record<string, any>[] | undefined
      );

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${template.templateName}`);
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const logs = await storage.getApiLogs(1000);

      const totalImports = logs.length;
      const successfulImports = logs.filter(log => log.status === "success").length;
      const failedImports = logs.filter(log => log.status === "failed").length;
      const processingImports = logs.filter(log => log.status === "processing").length;
      const successRate = totalImports > 0 ? ((successfulImports / totalImports) * 100).toFixed(1) : "0.0";

      res.json({
        totalImports,
        successfulImports,
        failedImports,
        processingImports,
        successRate: parseFloat(successRate),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/health/erpnext", async (req, res) => {
    try {
      const client = getERPNextClient();
      const health = await client.checkHealth();
      res.json(health);
    } catch (error: any) {
      console.error('ERPNext health check failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        statusCode: 500,
        responseTime: 0,
      });
    }
  });

  app.get("/api/autofix/strategies", async (req, res) => {
    try {
      const strategies = autoFixMiddleware.getStrategies().map(s => ({
        description: s.description,
        pattern: s.errorPattern.source
      }));
      
      res.json({
        strategies,
        totalStrategies: strategies.length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/autofix/retry", async (req, res) => {
    try {
      const { module, data, error } = req.body;
      
      if (!module || !data || !error) {
        return res.status(400).json({ message: "Module, data, and error are required" });
      }
      
      const result = await autoFixMiddleware.processRecord(module, data, error);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/config/erpnext", async (req, res) => {
    try {
      const baseUrl = await storage.getConfiguration("erpnext_base_url");
      const apiKey = await storage.getConfiguration("erpnext_api_key");
      const apiSecret = await storage.getConfiguration("erpnext_api_secret");

      res.json({
        baseUrl: baseUrl || "",
        apiKey: apiKey || "",
        apiSecret: apiSecret || "",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/config/erpnext", async (req, res) => {
    try {
      const { baseUrl, apiKey, apiSecret } = req.body;

      if (!baseUrl || !apiKey || !apiSecret) {
        return res.status(400).json({ message: "All fields are required" });
      }

      await storage.setConfiguration("erpnext_base_url", baseUrl, "ERPNext base URL");
      await storage.setConfiguration("erpnext_api_key", apiKey, "ERPNext API key");
      await storage.setConfiguration("erpnext_api_secret", apiSecret, "ERPNext API secret");

      const client = getERPNextClient();
      client.forceReinit();

      res.json({ message: "Configuration saved successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/health/database", async (req, res) => {
    try {
      const start = Date.now();

      await db.select().from(configuration).limit(1);

      const tables = await Promise.all([
        db.select().from(stagingErpnextImports).limit(1),
        db.select().from(apiLogs).limit(1),
        db.select().from(excelTemplates).limit(1)
      ]);

      const responseTime = Date.now() - start;
      res.json({ 
        success: true, 
        message: "Database connection successful",
        responseTime,
        tablesAccessible: true
      });
    } catch (error) {
      console.error("Database health check failed:", error);
      res.status(500).json({ 
        success: false, 
        error: "Database connection failed",
        message: error instanceof Error ? error.message : "Unknown error",
        tablesAccessible: false
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processImport(stagingId: string, module: string, data: Record<string, any>[]) {
  try {
    await storage.updateStagingImportStatus(stagingId, "processing");

    const client = getERPNextClient();
    let successCount = 0;
    let failureCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      let response;
      let autoFixResult;

      try {
        switch (module) {
          case "Item":
            response = await client.createItem(record);
            break;
          case "Customer":
            response = await client.createCustomer(record);
            break;
          case "Sales Order":
            response = await client.createSalesOrder(record);
            break;
          case "Sales Invoice":
            response = await client.createSalesInvoice(record);
            break;
          case "Payment Entry":
            response = await client.createPaymentEntry(record);
            break;
          default:
            throw new Error(`Unsupported module: ${module}`);
        }

        if (response.success) {
          successCount++;
        } else {
          console.log(`Record failed, attempting auto-fix. Error: ${response.error}`);
          autoFixResult = await autoFixMiddleware.processRecord(module, record, response.error || "Unknown error");
          
          if (autoFixResult.success) {
            successCount++;
            console.log(`Auto-fix successful for row ${i + 2}. Fixes applied: ${autoFixResult.fixesApplied?.join(', ')}`);
          } else {
            failureCount++;
            errors.push({
              row: i + 2,
              data: record,
              error: autoFixResult.error,
              autoFixAttempted: true,
              fixesApplied: autoFixResult.fixesApplied
            });
          }
        }

        const logSuccess = response.success || (autoFixResult?.success || false);
        await storage.createApiLog({
          stagingId,
          filename: (await storage.getStagingImport(stagingId))?.filename || "unknown",
          module,
          endpoint: `/api/resource/${module}`,
          method: "POST",
          recordCount: 1,
          successCount: logSuccess ? 1 : 0,
          failureCount: logSuccess ? 0 : 1,
          status: logSuccess ? "success" : "failed",
          erpnextResponse: logSuccess ? (response.data || autoFixResult?.data) : null,
          errors: logSuccess ? null : [{
            message: autoFixResult?.error || response.error,
            autoFixAttempted: !response.success,
            fixesApplied: autoFixResult?.fixesApplied
          }],
          responseTime: response.responseTime,
        });
      } catch (recordError: any) {
        failureCount++;
        errors.push({
          row: i + 2,
          data: record,
          error: recordError.message || "Unknown error during record processing",
        });
        await storage.createApiLog({
          stagingId,
          filename: (await storage.getStagingImport(stagingId))?.filename || "unknown",
          module,
          endpoint: `/api/resource/${module}`,
          method: "POST",
          recordCount: 1,
          successCount: 0,
          failureCount: 1,
          status: "failed",
          erpnextResponse: null,
          errors: [{ message: recordError.message || "Unknown error during record processing" }],
          responseTime: recordError.responseTime || 0,
        });
      }
    }

    const finalStatus = failureCount === 0 ? "completed" : "failed";
    await storage.updateStagingImportStatus(stagingId, finalStatus, new Date());

    await storage.createApiLog({
      stagingId,
      filename: (await storage.getStagingImport(stagingId))?.filename || "unknown",
      module,
      endpoint: `/api/resource/${module}`,
      method: "POST",
      recordCount: data.length,
      successCount,
      failureCount,
      status: finalStatus,
      erpnextResponse: { summary: `Processed ${data.length} records` },
      errors: errors.length > 0 ? errors : null,
      responseTime: 0,
    });
  } catch (error: any) {
    await storage.updateStagingImportStatus(stagingId, "failed", new Date());
    console.error("Error processing import:", error);
    await storage.createApiLog({
      stagingId,
      filename: "unknown",
      module,
      endpoint: `/api/resource/${module}`,
      method: "POST",
      recordCount: data.length,
      successCount: 0,
      failureCount: data.length,
      status: "failed",
      erpnextResponse: null,
      errors: [{ message: `Overall processing failed: ${error.message || "Unknown error"}` }],
      responseTime: 0,
    });
  }
          }
