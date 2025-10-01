// scripts/fix-api-logs-schema.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

async function fixApiLogsSchema() {
  console.log("🔍 Checking api_logs table schema...\n");
  
  try {
    // First, check current schema
    const currentColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'api_logs'
      ORDER BY ordinal_position
    `);

    console.log("📋 Current api_logs columns:");
    currentColumns.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    console.log("");

    // Define required columns
    const requiredColumns = [
      'id', 'staging_id', 'filename', 'module', 'endpoint', 'method',
      'record_count', 'success_count', 'failure_count', 'status',
      'erpnext_response', 'errors', 'response_time', 'created_at'
    ];

    const existingColumns = currentColumns.rows.map((row: any) => row.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log("✅ All required columns exist!");
      return;
    }

    console.log(`⚠️  Missing columns: ${missingColumns.join(', ')}\n`);
    console.log("🔧 Adding missing columns...\n");

    // Add filename column
    if (missingColumns.includes('filename')) {
      console.log("  Adding 'filename' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS filename text NOT NULL DEFAULT 'unknown'
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN filename DROP DEFAULT
      `);
      console.log("  ✓ filename column added");
    }

    // Add staging_id column
    if (missingColumns.includes('staging_id')) {
      console.log("  Adding 'staging_id' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS staging_id uuid
      `);
      console.log("  ✓ staging_id column added");
    }

    // Add module column
    if (missingColumns.includes('module')) {
      console.log("  Adding 'module' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT 'Unknown'
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN module DROP DEFAULT
      `);
      console.log("  ✓ module column added");
    }

    // Add endpoint column
    if (missingColumns.includes('endpoint')) {
      console.log("  Adding 'endpoint' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS endpoint text NOT NULL DEFAULT '/api/unknown'
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN endpoint DROP DEFAULT
      `);
      console.log("  ✓ endpoint column added");
    }

    // Add method column
    if (missingColumns.includes('method')) {
      console.log("  Adding 'method' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS method text NOT NULL DEFAULT 'POST'
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN method DROP DEFAULT
      `);
      console.log("  ✓ method column added");
    }

    // Add record_count column
    if (missingColumns.includes('record_count')) {
      console.log("  Adding 'record_count' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS record_count integer NOT NULL DEFAULT 0
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN record_count DROP DEFAULT
      `);
      console.log("  ✓ record_count column added");
    }

    // Add success_count column
    if (missingColumns.includes('success_count')) {
      console.log("  Adding 'success_count' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS success_count integer NOT NULL DEFAULT 0
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN success_count DROP DEFAULT
      `);
      console.log("  ✓ success_count column added");
    }

    // Add failure_count column
    if (missingColumns.includes('failure_count')) {
      console.log("  Adding 'failure_count' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS failure_count integer NOT NULL DEFAULT 0
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN failure_count DROP DEFAULT
      `);
      console.log("  ✓ failure_count column added");
    }

    // Add status column
    if (missingColumns.includes('status')) {
      console.log("  Adding 'status' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN status DROP DEFAULT
      `);
      console.log("  ✓ status column added");
    }

    // Add erpnext_response column
    if (missingColumns.includes('erpnext_response')) {
      console.log("  Adding 'erpnext_response' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS erpnext_response jsonb
      `);
      console.log("  ✓ erpnext_response column added");
    }

    // Add errors column
    if (missingColumns.includes('errors')) {
      console.log("  Adding 'errors' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS errors jsonb
      `);
      console.log("  ✓ errors column added");
    }

    // Add response_time column
    if (missingColumns.includes('response_time')) {
      console.log("  Adding 'response_time' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS response_time integer NOT NULL DEFAULT 0
      `);
      await db.execute(sql`
        ALTER TABLE api_logs 
        ALTER COLUMN response_time DROP DEFAULT
      `);
      console.log("  ✓ response_time column added");
    }

    // Add created_at column
    if (missingColumns.includes('created_at')) {
      console.log("  Adding 'created_at' column...");
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT NOW()
      `);
      console.log("  ✓ created_at column added");
    }

    console.log("\n🔧 Creating indexes for performance...");

    // Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_api_logs_staging_id 
      ON api_logs(staging_id)
    `);
    console.log("  ✓ Index on staging_id created");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_api_logs_created_at 
      ON api_logs(created_at DESC)
    `);
    console.log("  ✓ Index on created_at created");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_api_logs_status 
      ON api_logs(status)
    `);
    console.log("  ✓ Index on status created");

    // Verify the fix
    const updatedColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'api_logs'
      ORDER BY ordinal_position
    `);
    
    console.log("\n✅ Updated api_logs schema:");
    updatedColumns.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

// Run the migration
fixApiLogsSchema()
  .then(() => {
    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
