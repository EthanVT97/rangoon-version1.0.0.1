import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

async function setupDatabase() {
  console.log("🚀 Starting complete database setup...\n");
  
  try {
    // 1. Create configuration table
    console.log("📋 Creating configuration table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS configuration (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        key text NOT NULL UNIQUE,
        value text NOT NULL,
        description text,
        created_at timestamp NOT NULL DEFAULT NOW(),
        updated_at timestamp NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ Configuration table created\n");

    // 2. Create staging_erpnext_imports table
    console.log("📋 Creating staging_erpnext_imports table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS staging_erpnext_imports (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        filename text NOT NULL,
        module text NOT NULL,
        record_count integer NOT NULL,
        parsed_data jsonb NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        created_at timestamp NOT NULL DEFAULT NOW(),
        completed_at timestamp
      )
    `);
    console.log("✅ Staging imports table created\n");

    // 3. Create api_logs table with ALL required columns
    console.log("📋 Creating api_logs table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_logs (
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
    console.log("✅ API logs table created\n");

    // 4. Create excel_templates table
    console.log("📋 Creating excel_templates table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS excel_templates (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        module text NOT NULL UNIQUE,
        template_name text NOT NULL,
        columns jsonb NOT NULL,
        sample_data jsonb,
        created_at timestamp NOT NULL DEFAULT NOW(),
        updated_at timestamp NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ Excel templates table created\n");

    // 5. Verify columns exist before creating indexes
    console.log("🔍 Verifying column names...");
    
    const apiLogsColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'api_logs'
    `);
    
    const stagingColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'staging_erpnext_imports'
    `);
    
    console.log("📋 api_logs columns:", apiLogsColumns.rows.map((r: any) => r.column_name).join(', '));
    console.log("📋 staging_erpnext_imports columns:", stagingColumns.rows.map((r: any) => r.column_name).join(', '));
    console.log("");

    // 6. Create indexes for performance
    console.log("🔧 Creating indexes...");
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_api_logs_staging_id 
        ON api_logs(staging_id)
      `);
      console.log("  ✓ Index on api_logs.staging_id created");
    } catch (e) {
      console.log("  ⚠ Could not create index on staging_id:", (e as Error).message);
    }
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_api_logs_created_at 
        ON api_logs(created_at DESC)
      `);
      console.log("  ✓ Index on api_logs.created_at created");
    } catch (e) {
      console.log("  ⚠ Could not create index on api_logs.created_at:", (e as Error).message);
    }
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_api_logs_status 
        ON api_logs(status)
      `);
      console.log("  ✓ Index on api_logs.status created");
    } catch (e) {
      console.log("  ⚠ Could not create index on api_logs.status:", (e as Error).message);
    }
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_staging_imports_status 
        ON staging_erpnext_imports(status)
      `);
      console.log("  ✓ Index on staging_erpnext_imports.status created");
    } catch (e) {
      console.log("  ⚠ Could not create index on staging_erpnext_imports.status:", (e as Error).message);
    }
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_staging_imports_created_at 
        ON staging_erpnext_imports(created_at DESC)
      `);
      console.log("  ✓ Index on staging_erpnext_imports.created_at created");
    } catch (e) {
      console.log("  ⚠ Could not create index on staging_erpnext_imports.created_at:", (e as Error).message);
    }
    
    console.log("✅ Index creation completed\n");

    // 7. Verify tables exist
    console.log("🔍 Verifying table creation...");
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log("📋 Existing tables:");
    tables.rows.forEach((row: any) => {
      console.log(`  ✓ ${row.table_name}`);
    });
    console.log("");

    // 8. Seed initial configuration
    console.log("🌱 Seeding initial configuration...");
    
    await db.execute(sql`
      INSERT INTO configuration (key, value, description)
      VALUES 
        ('app_version', '1.0.0', 'Application version'),
        ('max_file_size', '10485760', 'Maximum file size in bytes (10MB)'),
        ('supported_formats', 'xlsx,xls', 'Supported file formats')
      ON CONFLICT (key) DO NOTHING
    `);
    
    console.log("✅ Initial configuration seeded\n");

    // 9. Seed templates
    console.log("🌱 Seeding Excel templates...");
    
    const templates = [
      {
        module: 'Item',
        templateName: 'Item_Template.xlsx',
        columns: JSON.stringify(['item_code', 'item_name', 'item_group', 'stock_uom', 'description', 'standard_rate', 'opening_stock', 'valuation_rate']),
        sampleData: JSON.stringify([{
          item_code: 'ITEM-001',
          item_name: 'Sample Product',
          item_group: 'Products',
          stock_uom: 'Nos',
          description: 'Sample product description',
          standard_rate: '1000',
          opening_stock: '10',
          valuation_rate: '800'
        }])
      },
      {
        module: 'Customer',
        templateName: 'Customer_Template.xlsx',
        columns: JSON.stringify(['customer_name', 'customer_type', 'customer_group', 'territory', 'mobile_no', 'email_id']),
        sampleData: JSON.stringify([{
          customer_name: 'Sample Customer',
          customer_type: 'Company',
          customer_group: 'Commercial',
          territory: 'All Territories',
          mobile_no: '+95912345678',
          email_id: 'customer@example.com'
        }])
      },
      {
        module: 'Sales Order',
        templateName: 'SalesOrder_Template.xlsx',
        columns: JSON.stringify(['customer', 'delivery_date', 'item_code', 'qty', 'rate']),
        sampleData: JSON.stringify([{
          customer: 'CUST-001',
          delivery_date: '2025-10-31',
          item_code: 'ITEM-001',
          qty: '5',
          rate: '1000'
        }])
      },
      {
        module: 'Sales Invoice',
        templateName: 'SalesInvoice_Template.xlsx',
        columns: JSON.stringify(['customer', 'due_date', 'item_code', 'qty', 'rate']),
        sampleData: JSON.stringify([{
          customer: 'CUST-001',
          due_date: '2025-11-30',
          item_code: 'ITEM-001',
          qty: '3',
          rate: '1000'
        }])
      },
      {
        module: 'Payment Entry',
        templateName: 'PaymentEntry_Template.xlsx',
        columns: JSON.stringify(['payment_type', 'party_type', 'party', 'paid_amount', 'received_amount']),
        sampleData: JSON.stringify([{
          payment_type: 'Receive',
          party_type: 'Customer',
          party: 'CUST-001',
          paid_amount: '5000',
          received_amount: '5000'
        }])
      }
    ];

    for (const template of templates) {
      try {
        await db.execute(sql`
          INSERT INTO excel_templates (module, template_name, columns, sample_data)
          VALUES (
            ${template.module},
            ${template.templateName},
            ${template.columns}::jsonb,
            ${template.sampleData}::jsonb
          )
          ON CONFLICT (module) DO NOTHING
        `);
        console.log(`  ✓ Template for ${template.module} seeded`);
      } catch (templateError) {
        console.log(`  ⚠ Could not seed template for ${template.module}:`, (templateError as Error).message);
      }
    }
    
    console.log("✅ Templates seeded\n");

    // 10. Final verification
    console.log("✅ Database setup completed successfully!");
    console.log("\n📊 Summary:");
    console.log("  ✓ All tables created");
    console.log("  ✓ Indexes created (where possible)");
    console.log("  ✓ Initial data seeded");
    console.log("  ✓ Database ready for use\n");

  } catch (error) {
    console.error("\n❌ Database setup failed:", error);
    throw error;
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log("✅ Setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
