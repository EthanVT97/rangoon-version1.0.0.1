// scripts/debug-validation.ts
// Run this to see what columns are expected vs what you're uploading

import { excelParser } from "../server/services/excelParser.js";
import { dataValidator } from "../server/services/validator.js";
import * as fs from "fs";
import * as path from "path";

async function debugValidation() {
  console.log("🔍 Excel Upload Validation Debugger\n");
  
  // Show expected columns for each module
  const modules = ["Item", "Customer", "Sales Order", "Sales Invoice", "Payment Entry"];
  
  console.log("📋 Expected columns for each module:\n");
  
  const expectedColumns = {
    "Item": [
      "item_code (required, string)",
      "item_name (required, string)",
      "item_group (required, string)",
      "stock_uom (required, string)",
      "standard_rate (optional, number)",
      "opening_stock (optional, number)",
      "valuation_rate (optional, number)"
    ],
    "Customer": [
      "customer_name (required, string)",
      "customer_type (required, string)",
      "customer_group (required, string)",
      "territory (required, string)",
      "email_id (optional, email)",
      "mobile_no (optional, string)"
    ],
    "Sales Order": [
      "customer (required, string)",
      "delivery_date (required, date YYYY-MM-DD)",
      "item_code (required, string)",
      "qty (required, number)",
      "rate (required, number)"
    ],
    "Sales Invoice": [
      "customer (required, string)",
      "due_date (optional, date YYYY-MM-DD)",
      "item_code (required, string)",
      "qty (required, number)",
      "rate (required, number)"
    ],
    "Payment Entry": [
      "payment_type (required, string)",
      "party_type (required, string)",
      "party (required, string)",
      "paid_amount (required, number)",
      "received_amount (required, number)"
    ]
  };
  
  for (const module of modules) {
    console.log(`\n${module}:`);
    expectedColumns[module as keyof typeof expectedColumns].forEach(col => {
      console.log(`  ✓ ${col}`);
    });
  }
  
  console.log("\n\n💡 Common issues:\n");
  console.log("1. Column names must match EXACTLY (case-sensitive)");
  console.log("2. Required fields cannot be empty");
  console.log("3. Numbers should be numbers (not text)");
  console.log("4. Dates must be in YYYY-MM-DD format (e.g., 2025-10-31)");
  console.log("5. No extra spaces in column headers");
  
  console.log("\n\n🔧 To test your Excel file:\n");
  console.log("1. Save this file as scripts/debug-validation.ts");
  console.log("2. Place your Excel file in the project root as 'test.xlsx'");
  console.log("3. Run: npm run tsx scripts/test-excel.ts");
  
  // If test file exists, parse and validate it
  const testFile = path.resolve(process.cwd(), "test.xlsx");
  if (fs.existsSync(testFile)) {
    console.log("\n📄 Found test.xlsx, analyzing...\n");
    
    const buffer = fs.readFileSync(testFile);
    const parsed = excelParser.parseFile(buffer);
    
    console.log(`Found ${parsed.rowCount} rows with columns:`);
    parsed.columns.forEach(col => {
      console.log(`  - "${col}"`);
    });
    
    console.log("\nFirst row of data:");
    console.log(JSON.stringify(parsed.data[0], null, 2));
    
    // Try validating as Sales Order
    console.log("\n\nTrying to validate as Sales Order:");
    const validation = dataValidator.validate("Sales Order", parsed.data);
    
    if (validation.isValid) {
      console.log("✅ Validation passed!");
    } else {
      console.log("❌ Validation failed with errors:");
      validation.errors.forEach(err => {
        console.log(`  Row ${err.row}: ${err.field} - ${err.message}`);
      });
    }
  }
}

debugValidation();
