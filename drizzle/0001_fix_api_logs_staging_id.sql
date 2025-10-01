import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

async function fixStagingIdColumn() {
  console.log("Checking api_logs table schema...");
  
  try {
    // Check if staging_id column exists
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'api_logs' 
      AND column_name = 'staging_id'
    `);

    if (result.rows.length === 0) {
      console.log("Adding staging_id column to api_logs table...");
      
      // Add the column
      await db.execute(sql`
        ALTER TABLE api_logs 
        ADD COLUMN staging_id uuid
      `);
      
      // Add index for performance
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_api_logs_staging_id 
        ON api_logs(staging_id)
      `);
      
      console.log("✓ staging_id column added successfully");
    } else {
      console.log("✓ staging_id column already exists");
    }

    // Verify the fix
    const verify = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'api_logs'
      ORDER BY ordinal_position
    `);
    
    console.log("\nCurrent api_logs schema:");
    verify.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run the migration
fixStagingIdColumn()
  .then(() => {
    console.log("\n✓ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  });
