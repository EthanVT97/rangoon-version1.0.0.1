import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

async function cleanupApiLogs() {
  console.log("🧹 Cleaning up api_logs table...\n");
  
  try {
    // Check current state
    const currentColumns = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'api_logs'
      ORDER BY ordinal_position
    `);

    console.log("📋 Current columns:");
    currentColumns.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    console.log("");

    // Check if there's any data
    const rowCount = await db.execute(sql`SELECT COUNT(*) as count FROM api_logs`);
    const hasData = rowCount.rows[0].count > 0;
    
    console.log(`📊 Current row count: ${rowCount.rows[0].count}\n`);

    if (hasData) {
      console.log("⚠️  Table has data. Creating backup...");
      
      // Create backup table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS api_logs_backup AS 
        SELECT * FROM api_logs
      `);
      
      console.log("✅ Backup created as 'api_logs_backup'\n");
    }

    // Drop and recreate the table with correct schema
    console.log("🔧 Dropping and recreating api_logs table with correct schema...");
    
    await db.execute(sql`DROP TABLE IF EXISTS api_logs CASCADE`);
    console.log("  ✓ Old table dropped");
    
    await db.execute(sql`
      CREATE TABLE api_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        staging_id uuid,
        filename text NOT NULL,
        module text NOT NULL,
        endpoint text NOT NULL,
        method text NOT NULL,
        record_count integer NOT NULL,
        success_count integer NOT NULL DEFAULT 0,
        failure_count integer NOT NULL DEFAULT 0,
        status text NOT NULL,
        erpnext_response jsonb,
        errors jsonb,
        response_time integer NOT NULL,
        created_at timestamp NOT NULL DEFAULT NOW()
      )
    `);
    console.log("  ✓ New table created with correct schema\n");

    // Create indexes
    console.log("🔧 Creating indexes...");
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_api_logs_staging_id 
      ON api_logs(staging_id)
    `);
    console.log("  ✓ idx_api_logs_staging_id created");
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_api_logs_created_at 
      ON api_logs(created_at DESC)
    `);
    console.log("  ✓ idx_api_logs_created_at created");
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_api_logs_status 
      ON api_logs(status)
    `);
    console.log("  ✓ idx_api_logs_status created");

    // Verify new schema
    const finalColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'api_logs'
      ORDER BY ordinal_position
    `);
    
    console.log("\n✅ New api_logs schema:");
    finalColumns.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

    console.log("\n📋 Summary:");
    console.log("  ✅ Old table dropped");
    console.log("  ✅ New table created with correct schema");
    console.log("  ✅ All indexes created");
    if (hasData) {
      console.log("  ℹ️  Previous data backed up in 'api_logs_backup' table");
      console.log("  ℹ️  You can drop the backup later with: DROP TABLE api_logs_backup;");
    }
    console.log("\n🎉 Cleanup completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    throw error;
  }
}

// Run the cleanup
cleanupApiLogs()
  .then(() => {
    console.log("\n✅ You can now restart your server and it should work!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Cleanup failed:", error);
    process.exit(1);
  });
