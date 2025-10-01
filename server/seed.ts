import { storage } from './storage.js'; // Fixed: Added .js extension

async function seedDatabase() {
  console.log('Seeding database...');

  // Seed Excel templates for all ERPNext modules
  const templates = [
    {
      module: "Item",
      templateName: "Item_Template.xlsx",
      columns: [
        "item_code",
        "item_name",
        "item_group",
        "stock_uom",
        "description",
        "standard_rate",
        "opening_stock",
        "valuation_rate"
      ],
      sampleData: [
        {
          item_code: "ITEM-001",
          item_name: "Sample Product",
          item_group: "Products",
          stock_uom: "Nos",
          description: "Sample product description",
          standard_rate: "1000",
          opening_stock: "10",
          valuation_rate: "800"
        }
      ]
    },
    {
      module: "Customer",
      templateName: "Customer_Template.xlsx",
      columns: [
        "customer_name",
        "customer_type",
        "customer_group",
        "territory",
        "mobile_no",
        "email_id"
      ],
      sampleData: [
        {
          customer_name: "Sample Customer",
          customer_type: "Company",
          customer_group: "Commercial",
          territory: "All Territories",
          mobile_no: "+95912345678",
          email_id: "customer@example.com"
        }
      ]
    },
    {
      module: "Sales Order",
      templateName: "SalesOrder_Template.xlsx",
      columns: [
        "customer",
        "delivery_date",
        "item_code",
        "qty",
        "rate"
      ],
      sampleData: [
        {
          customer: "CUST-001",
          delivery_date: "2025-10-31",
          item_code: "ITEM-001",
          qty: "5",
          rate: "1000"
        }
      ]
    },
    {
      module: "Sales Invoice",
      templateName: "SalesInvoice_Template.xlsx",
      columns: [
        "customer",
        "due_date",
        "item_code",
        "qty",
        "rate"
      ],
      sampleData: [
        {
          customer: "CUST-001",
          due_date: "2025-11-30",
          item_code: "ITEM-001",
          qty: "3",
          rate: "1000"
        }
      ]
    },
    {
      module: "Payment Entry",
      templateName: "PaymentEntry_Template.xlsx",
      columns: [
        "payment_type",
        "party_type",
        "party",
        "paid_amount",
        "received_amount"
      ],
      sampleData: [
        {
          payment_type: "Receive",
          party_type: "Customer",
          party: "CUST-001",
          paid_amount: "5000",
          received_amount: "5000"
        }
      ]
    }
  ];

  for (const template of templates) {
    try {
      const existing = await storage.getTemplate(template.module);
      if (!existing) {
        await storage.createTemplate(template);
        console.log(`Created template for ${template.module}`);
      } else {
        console.log(`Template for ${template.module} already exists`);
      }
    } catch (error) {
      console.error(`Error creating template for ${template.module}:`, error);
    }
  }

  // Seed configuration
  const configs = [
    { key: 'app_version', value: '1.0.0', description: 'Application version' },
    { key: 'max_file_size', value: '10485760', description: 'Maximum file size in bytes (10MB)' },
    { key: 'supported_formats', value: 'xlsx,xls', description: 'Supported file formats' }
  ];

  for (const config of configs) {
    try {
      await storage.setConfiguration(config.key, config.value, config.description);
      console.log(`Set configuration: ${config.key}`);
    } catch (error) {
      console.error(`Error setting configuration ${config.key}:`, error);
    }
  }

  console.log('Database seeding completed!');
}

seedDatabase().catch(console.error);
