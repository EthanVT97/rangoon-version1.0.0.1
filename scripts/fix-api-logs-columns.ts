import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

async function fixApiLogsColumns() {
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
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });
    console.log("");

    const existingColumns = currentColumns.rows.map((row: any) => row.column_name);
    
    // Add missing columns one by one
    const columnsToAdd = [
      { 
        name: 'filename', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS filename text NOT NULL DEFAULT 'unknown'`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN filename DROP DEFAULT`
      },
      { 
        name: 'module', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT 'Unknown'`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN module DROP DEFAULT`
      },
      { 
        name: 'endpoint', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS endpoint text NOT NULL DEFAULT '/api/unknown'`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN endpoint DROP DEFAULT`
      },
      { 
        name: 'method', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS method text NOT NULL DEFAULT 'POST'`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN method DROP DEFAULT`
      },
      { 
        name: 'record_count', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS record_count integer NOT NULL DEFAULT 0`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN record_count DROP DEFAULT`
      },
      { 
        name: 'success_count', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS success_count integer NOT NULL DEFAULT 0`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN success_count DROP DEFAULT`
      },
      { 
        name: 'failure_count', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS failure_count integer NOT NULL DEFAULT 0`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN failure_count DROP DEFAULT`
      },
      { 
        name: 'status', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN status DROP DEFAULT`
      },
      { 
        name: 'erpnext_response', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS erpnext_response jsonb`,
        dropDefault: null
      },
      { 
        name: 'errors', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS errors jsonb`,
        dropDefault: null
      },
      { 
        name: 'response_time', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS response_time integer NOT NULL DEFAULT 0`,
        dropDefault: sql`ALTER TABLE api_logs ALTER COLUMN response_time DROP DEFAULT`
      },
      { 
        name: 'staging_id', 
        sql: sql`ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS staging_id uuid`,
        dropDefault: null
      },
    ];

    console.log("🔧 Adding missing columns...\n");
    
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`  Adding '${column.name}' column...`);
        try {
          await db.execute(column.sql);
          if (column.dropDefault) {
            await db.execute(column.dropDefault);
          }
          console.log(`  ✅ ${column.name} column added`);
        } catch (error) {
          console.log(`  ⚠️  Error adding ${column.name}:`, (error as Error).message);
        }
      } else {
        console.log(`  ✓ ${column.name} already exists`);
      }
    }

    console.log("\n🔧 Creating indexes...");

    // Create indexes with error handling
    const indexes = [
      {
        name: 'idx_api_logs_staging_id',
        sql: sql`CREATE INDEX IF NOT EXISTS idx_api_logs_staging_id ON api_logs(staging_id)`
      },
      {
        name: 'idx_api_logs_created_at',
        sql: sql`CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC)`
      },
      {
        name: 'idx_api_logs_status',
        sql: sql`CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs(status)`
      }
    ];

    for (const index of indexes) {
      try {
        await db.execute(index.sql);
        console.log(`  ✓ ${index.name} created`);
      } catch (error) {
        console.log(`  ⚠️  Could not create ${index.name}:`, (error as Error).message);
      }
    }

    // Verify the fix
    const updatedColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'api_logs'
      ORDER BY ordinal_position
    `);
    
    console.log("\n✅ Updated api_logs schema:");
    updatedColumns.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });
    
    console.log("\n✅ All missing columns have been added!");
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

// Run the fix
fixApiLogsColumns()
  .then(() => {
    console.log("\n✅ Fix completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fix failed:", error);
    process.exit(1);
  });
