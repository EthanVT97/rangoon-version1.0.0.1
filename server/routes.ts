import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { excelParser } from "./services/excelParser";
import { dataValidator } from "./services/validator";
import { getERPNextClient } from "./services/erpnextClient";
import { db } from "./database"; // Assuming db is imported from a database configuration file
import { configuration, stagingErpnextImports, apiLogs, excelTemplates } from "./schema"; // Assuming schema holds table definitions

export async function registerRoutes(app: Express): Promise<Server> {
  // Environment validation for production
  const requiredEnvVars = ['DATABASE_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // File upload configuration
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.mimetype === "application/vnd.ms-excel") {
        cb(null, true);
      } else {
        cb(new Error("Only .xlsx and .xls files are allowed"));
      }
    },
  });

  // Upload and process Excel file
  app.post("/api/upload-excel", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { module } = req.body;
      if (!module) {
        return res.status(400).json({ message: "Module is required" });
      }

      // Parse Excel file
      const parsed = excelParser.parseFile(req.file.buffer);

      // Validate data
      const validation = dataValidator.validate(module, parsed.data);

      if (!validation.isValid) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      // Store in staging table
      const stagingImport = await storage.createStagingImport({
        filename: req.file.originalname,
        module,
        recordCount: parsed.rowCount,
        parsedData: parsed.data,
        status: "pending",
      });

      // Start processing in background (async)
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

  // Get staging import status
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

  // Get API logs
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

  // Get all API logs (alias for compatibility)
  app.get("/api/logs/all", async (req, res) => {
    try {
      const logs = await storage.getApiLogs(100);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Download Excel template
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

  // Get dashboard statistics
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

  // Check ERPNext API health
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

  // Get ERPNext configuration
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

  // Save ERPNext configuration
  app.post("/api/config/erpnext", async (req, res) => {
    try {
      const { baseUrl, apiKey, apiSecret } = req.body;

      if (!baseUrl || !apiKey || !apiSecret) {
        return res.status(400).json({ message: "All fields are required" });
      }

      await storage.setConfiguration("erpnext_base_url", baseUrl, "ERPNext base URL");
      await storage.setConfiguration("erpnext_api_key", apiKey, "ERPNext API key");
      await storage.setConfiguration("erpnext_api_secret", apiSecret, "ERPNext API secret");

      // Reset ERPNext client to pick up new configuration
      const client = getERPNextClient();
      client['initialized'] = false; // Force re-initialization

      res.json({ message: "Configuration saved successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Health check endpoints
  app.get("/api/health/database", async (req, res) => {
    try {
      const start = Date.now();

      // Test basic connection
      await db.select().from(configuration).limit(1);

      // Test all table accessibility
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

// Background processing function
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
          failureCount++;
          errors.push({
            row: i + 2,
            data: record,
            error: response.error,
          });
        }

        // Log individual record processing
        await storage.createApiLog({
          stagingId,
          filename: (await storage.getStagingImport(stagingId))?.filename || "unknown",
          module,
          endpoint: `/api/resource/${module}`,
          method: "POST",
          recordCount: 1,
          successCount: response.success ? 1 : 0,
          failureCount: response.success ? 0 : 1,
          status: response.success ? "success" : "failed",
          erpnextResponse: response.data,
          errors: response.success ? null : [{ message: response.error }],
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

    // Create summary log
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
      responseTime: 0, // This might need to be calculated if relevant for summary
    });
  } catch (error: any) {
    await storage.updateStagingImportStatus(stagingId, "failed", new Date());
    console.error("Error processing import:", error);
    // Ensure a log entry for the overall failure if not already created
    await storage.createApiLog({
      stagingId,
      filename: "unknown", // Filename might not be available in this catch block
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