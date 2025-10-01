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
    // Check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'api_logs'
      ) as exists
    `);

    if (!tableExists.rows[0].exists) {
      console.log("❌ api_logs table doesn't exist. Creating it...\n");
      
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
      
      console.log("✅ api_logs table created\n");
    } else {
      console.log("✅ api_logs table exists\n");
    }

    // Check current columns
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
    
    // Define all required columns with their SQL
    const requiredColumns = [
      {
        name: 'id',
        check: () => existingColumns.includes('id'),
        add: null // Primary key, should already exist
      },
      {
        name: 'staging_id',
        check: () => existingColumns.includes('staging_id'),
        add: async () => {
          console.log("  Adding 'staging_id' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN staging_id uuid`);
          console.log("  ✅ staging_id added");
        }
      },
      {
        name: 'filename',
        check: () => existingColumns.includes('filename'),
        add: async () => {
          console.log("  Adding 'filename' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN filename text NOT NULL DEFAULT 'unknown'`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN filename DROP DEFAULT`);
          console.log("  ✅ filename added");
        }
      },
      {
        name: 'module',
        check: () => existingColumns.includes('module'),
        add: async () => {
          console.log("  Adding 'module' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN module text NOT NULL DEFAULT 'Unknown'`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN module DROP DEFAULT`);
          console.log("  ✅ module added");
        }
      },
      {
        name: 'endpoint',
        check: () => existingColumns.includes('endpoint'),
        add: async () => {
          console.log("  Adding 'endpoint' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN endpoint text NOT NULL DEFAULT '/api/unknown'`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN endpoint DROP DEFAULT`);
          console.log("  ✅ endpoint added");
        }
      },
      {
        name: 'method',
        check: () => existingColumns.includes('method'),
        add: async () => {
          console.log("  Adding 'method' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN method text NOT NULL DEFAULT 'POST'`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN method DROP DEFAULT`);
          console.log("  ✅ method added");
        }
      },
      {
        name: 'record_count',
        check: () => existingColumns.includes('record_count'),
        add: async () => {
          console.log("  Adding 'record_count' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN record_count integer NOT NULL DEFAULT 0`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN record_count DROP DEFAULT`);
          console.log("  ✅ record_count added");
        }
      },
      {
        name: 'success_count',
        check: () => existingColumns.includes('success_count'),
        add: async () => {
          console.log("  Adding 'success_count' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN success_count integer NOT NULL DEFAULT 0`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN success_count DROP DEFAULT`);
          console.log("  ✅ success_count added");
        }
      },
      {
        name: 'failure_count',
        check: () => existingColumns.includes('failure_count'),
        add: async () => {
          console.log("  Adding 'failure_count' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN failure_count integer NOT NULL DEFAULT 0`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN failure_count DROP DEFAULT`);
          console.log("  ✅ failure_count added");
        }
      },
      {
        name: 'status',
        check: () => existingColumns.includes('status'),
        add: async () => {
          console.log("  Adding 'status' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN status text NOT NULL DEFAULT 'pending'`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN status DROP DEFAULT`);
          console.log("  ✅ status added");
        }
      },
      {
        name: 'erpnext_response',
        check: () => existingColumns.includes('erpnext_response'),
        add: async () => {
          console.log("  Adding 'erpnext_response' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN erpnext_response jsonb`);
          console.log("  ✅ erpnext_response added");
        }
      },
      {
        name: 'errors',
        check: () => existingColumns.includes('errors'),
        add: async () => {
          console.log("  Adding 'errors' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN errors jsonb`);
          console.log("  ✅ errors added");
        }
      },
      {
        name: 'response_time',
        check: () => existingColumns.includes('response_time'),
        add: async () => {
          console.log("  Adding 'response_time' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN response_time integer NOT NULL DEFAULT 0`);
          await db.execute(sql`ALTER TABLE api_logs ALTER COLUMN response_time DROP DEFAULT`);
          console.log("  ✅ response_time added");
        }
      },
      {
        name: 'created_at',
        check: () => existingColumns.includes('created_at'),
        add: async () => {
          console.log("  Adding 'created_at' column...");
          await db.execute(sql`ALTER TABLE api_logs ADD COLUMN created_at timestamp NOT NULL DEFAULT NOW()`);
          console.log("  ✅ created_at added");
        }
      }
    ];

    // Add missing columns
    console.log("🔧 Checking and adding missing columns...\n");
    
    let addedCount = 0;
    for (const column of requiredColumns) {
      if (!column.check()) {
        if (column.add) {
          try {
            await column.add();
            addedCount++;
          } catch (error) {
            console.log(`  ⚠️  Error adding ${column.name}:`, (error as Error).message);
          }
        }
      } else {
        console.log(`  ✓ ${column.name} already exists`);
      }
    }

    if (addedCount === 0) {
      console.log("\n✅ All required columns already exist!\n");
    } else {
      console.log(`\n✅ Added ${addedCount} missing column(s)\n`);
    }

    // Create indexes
    console.log("🔧 Creating indexes...");

    const indexes = [
      {
        name: 'idx_api_logs_staging_id',
        sql: sql`CREATE INDEX IF NOT EXISTS idx_api_logs_staging_id ON api_logs(staging_id)`
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

    // Try to create created_at index separately (it might have naming issues)
    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC)`);
      console.log(`  ✓ idx_api_logs_created_at created`);
    } catch (error) {
      console.log(`  ⚠️  Could not create idx_api_logs_created_at:`, (error as Error).message);
    }

    // Final verification
    const finalColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'api_logs'
      ORDER BY ordinal_position
    `);
    
    console.log("\n📋 Final api_logs schema:");
    finalColumns.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });
    
    console.log("\n✅ Schema fix completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Schema fix failed:", error);
    throw error;
  }
}

// Run the fix
fixApiLogsSchema()
  .then(() => {
    console.log("\n🎉 All done! You can now restart your server.\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fix failed:", error);
    process.exit(1);
  });
