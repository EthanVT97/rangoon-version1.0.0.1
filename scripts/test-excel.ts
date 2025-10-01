// scripts/test-excel.ts
// Place your Excel file as "test.xlsx" in the project root and run:
// npm run tsx scripts/test-excel.ts

import { excelParser } from "../server/services/excelParser.js";
import { dataValidator } from "../server/services/validator.js";
import * as fs from "fs";
import * as path from "path";

async function testExcelFile() {
  console.log("🧪 Testing Excel File Upload\n");
  console.log("=" .repeat(60));
  
  const testFile = path.resolve(process.cwd(), "test.xlsx");
  
  if (!fs.existsSync(testFile)) {
    console.log("\n❌ No test file found!");
    console.log("\nTo use this tool:");
    console.log("1. Place your Excel file in the project root");
    console.log("2. Rename it to 'test.xlsx'");
    console.log("3. Run: npm run tsx scripts/test-excel.ts");
    console.log("\n" + "=".repeat(60));
    return;
  }
  
  try {
    // Parse the Excel file
    console.log("\n📄 Parsing Excel file...");
    const buffer = fs.readFileSync(testFile);
    const parsed = excelParser.parseFile(buffer);
    
    console.log(`\n✅ Successfully parsed!`);
    console.log(`   Rows: ${parsed.rowCount}`);
    console.log(`   Columns: ${parsed.columns.length}`);
    
    console.log("\n📋 Columns found:");
    parsed.columns.forEach((col, idx) => {
      console.log(`   ${idx + 1}. "${col}"`);
    });
    
    console.log("\n📊 First row of data:");
    console.log(JSON.stringify(parsed.data[0], null, 2));
    
    // Try to guess the module based on columns
    console.log("\n🔍 Detecting module type...");
    const detectedModule = detectModule(parsed.columns);
    
    if (detectedModule) {
      console.log(`   Detected: ${detectedModule}`);
      
      // Show expected columns for this module
      console.log(`\n📝 Expected columns for ${detectedModule}:`);
      const expected = dataValidator.getExpectedFormat(detectedModule);
      if (expected) {
        expected.forEach((col, idx) => {
          console.log(`   ${idx + 1}. ${col}`);
        });
      }
      
      // Validate
      console.log(`\n✨ Validating data as ${detectedModule}...`);
      const validation = dataValidator.validate(detectedModule, parsed.data);
      
      if (validation.warnings && validation.warnings.length > 0) {
        console.log("\n⚠️  Warnings:");
        validation.warnings.forEach(warning => {
          console.log(`   - ${warning}`);
        });
      }
      
      if (validation.isValid) {
        console.log("\n✅ Validation PASSED!");
        console.log(`   All ${parsed.rowCount} rows are valid`);
        console.log("\n🎉 This file is ready to upload!");
      } else {
        console.log("\n❌ Validation FAILED!");
        console.log(`   Found ${validation.errors.length} error(s):\n`);
        
        // Group errors by type
        const errorsByField = groupBy(validation.errors, 'field');
        
        Object.entries(errorsByField).forEach(([field, fieldErrors]) => {
          console.log(`   Field: "${field}"`);
          fieldErrors.forEach((err: any) => {
            if (err.row) {
              console.log(`     Row ${err.row}: ${err.message}`);
              if (err.value !== undefined) {
                console.log(`       Current value: "${err.value}"`);
              }
              if (err.expectedType) {
                console.log(`       Expected type: ${err.expectedType}`);
              }
            } else {
              console.log(`     ${err.message}`);
            }
          });
          console.log("");
        });
        
        console.log("\n💡 Quick fixes:");
        console.log("   1. Check column names match exactly (case-sensitive)");
        console.log("   2. Ensure required fields are not empty");
        console.log("   3. Format numbers as numbers (not text)");
        console.log("   4. Format dates as YYYY-MM-DD");
      }
    } else {
      console.log("   ❓ Could not detect module type");
      console.log("\n   Supported modules:");
      console.log("   - Item");
      console.log("   - Customer");
      console.log("   - Sales Order");
      console.log("   - Sales Invoice");
      console.log("   - Payment Entry");
    }
    
    console.log("\n" + "=".repeat(60));
    
  } catch (error: any) {
    console.log("\n❌ Error:", error.message);
    console.log("\n" + "=".repeat(60));
  }
}

function detectModule(columns: string[]): string | null {
  const columnSet = new Set(columns.map(c => c.toLowerCase()));
  
  // Check for unique column combinations
  if (columnSet.has('item_code') && columnSet.has('stock_uom')) {
    return 'Item';
  }
  if (columnSet.has('customer_name') && columnSet.has('customer_type')) {
    return 'Customer';
  }
  if (columnSet.has('customer') && columnSet.has('delivery_date')) {
    return 'Sales Order';
  }
  if (columnSet.has('customer') && columnSet.has('due_date')) {
    return 'Sales Invoice';
  }
  if (columnSet.has('payment_type') && columnSet.has('party')) {
    return 'Payment Entry';
  }
  
  return null;
}

function groupBy(array: any[], key: string) {
  return array.reduce((result, item) => {
    const group = item[key] || 'unknown';
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

testExcelFile().catch(console.error);
