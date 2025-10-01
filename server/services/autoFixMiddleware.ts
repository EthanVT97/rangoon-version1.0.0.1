import { getERPNextClient } from './erpnextClient.js'; // Fixed: Added .js extension
import { storage } from '../storage.js'; // Fixed: Added .js extension

interface AutoFixStrategy {
  errorPattern: RegExp;
  description: string;
  fix: (data: Record<string, any>, error: string) => Promise<Record<string, any> | null>;
}

class AutoFixMiddleware {
  private strategies: AutoFixStrategy[] = [
    // Fix missing required fields
    {
      errorPattern: /field.*is mandatory/i,
      description: "Add default values for mandatory fields",
      fix: async (data: Record<string, any>, error: string) => {
        const fixedData = { ...data };
        
        // Extract field name from error
        const fieldMatch = error.match(/field ['"]?([^'"]+)['"]? is mandatory/i);
        if (!fieldMatch) return null;
        
        const field = fieldMatch[1].toLowerCase();
        
        // Apply common fixes based on field type
        const commonDefaults: Record<string, any> = {
          'naming_series': 'AUTO',
          'currency': 'USD',
          'company': 'Default Company',
          'customer_group': 'All Customer Groups',
          'territory': 'All Territories',
          'item_group': 'All Item Groups',
          'stock_uom': 'Nos',
          'is_stock_item': 1,
          'include_item_in_manufacturing': 0,
          'maintain_stock': 1,
          'disabled': 0,
          'has_batch_no': 0,
          'has_serial_no': 0,
          'is_purchase_item': 1,
          'is_sales_item': 1
        };
        
        if (commonDefaults[field] !== undefined) {
          fixedData[field] = commonDefaults[field];
          console.log(`Auto-fixed: Added default value '${commonDefaults[field]}' for field '${field}'`);
          return fixedData;
        }
        
        return null;
      }
    },
    
    // Fix duplicate name errors
    {
      errorPattern: /duplicate name|already exists/i,
      description: "Generate unique names for duplicates",
      fix: async (data: Record<string, any>, error: string) => {
        const fixedData = { ...data };
        
        if (fixedData.name || fixedData.item_code || fixedData.customer_name) {
          const timestamp = Date.now();
          const nameField = fixedData.name ? 'name' : 
                          fixedData.item_code ? 'item_code' : 'customer_name';
          
          const originalValue = fixedData[nameField];
          fixedData[nameField] = `${originalValue}_${timestamp}`;
          
          console.log(`Auto-fixed: Changed ${nameField} from '${originalValue}' to '${fixedData[nameField]}'`);
          return fixedData;
        }
        
        return null;
      }
    },
    
    // Fix invalid date formats
    {
      errorPattern: /invalid date|date format/i,
      description: "Convert dates to proper format",
      fix: async (data: Record<string, any>, error: string) => {
        const fixedData = { ...data };
        let hasChanges = false;
        
        // Common date fields
        const dateFields = ['posting_date', 'due_date', 'transaction_date', 'delivery_date'];
        
        for (const field of dateFields) {
          if (fixedData[field]) {
            try {
              const date = new Date(fixedData[field]);
              if (!isNaN(date.getTime())) {
                fixedData[field] = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                hasChanges = true;
                console.log(`Auto-fixed: Converted ${field} to proper date format`);
              }
            } catch (e) {
              // If date conversion fails, set to today
              fixedData[field] = new Date().toISOString().split('T')[0];
              hasChanges = true;
              console.log(`Auto-fixed: Set ${field} to current date due to invalid format`);
            }
          }
        }
        
        return hasChanges ? fixedData : null;
      }
    },
    
    // Fix number format issues
    {
      errorPattern: /invalid number|not a valid float/i,
      description: "Convert strings to proper numbers",
      fix: async (data: Record<string, any>, error: string) => {
        const fixedData = { ...data };
        let hasChanges = false;
        
        // Common numeric fields
        const numericFields = ['rate', 'amount', 'qty', 'quantity', 'price', 'cost'];
        
        for (const field of numericFields) {
          if (fixedData[field] && typeof fixedData[field] === 'string') {
            const numValue = parseFloat(fixedData[field].replace(/[^\d.-]/g, ''));
            if (!isNaN(numValue)) {
              fixedData[field] = numValue;
              hasChanges = true;
              console.log(`Auto-fixed: Converted ${field} from string to number: ${numValue}`);
            }
          }
        }
        
        return hasChanges ? fixedData : null;
      }
    },
    
  {
      errorPattern: /permission denied|not permitted/i,
      description: "Retry with administrative privileges",
      fix: async (data: Record<string, any>, error: string) => {
        console.log('Auto-fix: Permission error detected, attempting administrative retry (current implementation simply retries unchanged data).');
        return data; // Return unchanged data for retry, actual fix would require changing credentials or context
      }
    }
  ];

  async processRecord(
    module: string, 
    originalData: Record<string, any>, 
    error: string,
    maxRetries: number = 3
  ): Promise<{ success: boolean; data?: any; error?: string; fixesApplied?: string[] }> {
    
    let currentData = { ...originalData };
    const fixesApplied: string[] = [];
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Try to find and apply fixes
      for (const strategy of this.strategies) {
        if (strategy.errorPattern.test(error)) {
          console.log(`Applying auto-fix strategy: ${strategy.description}`);
          
          try {
            const fixedData = await strategy.fix(currentData, error);
            if (fixedData) {
              currentData = fixedData;
              fixesApplied.push(strategy.description);
              
              // Try to create record with fixed data
              const client = getERPNextClient();
              let response;
              
              switch (module) {
                case "Item":
                  response = await client.createItem(currentData);
                  break;
                case "Customer":
                  response = await client.createCustomer(currentData);
                  break;
                case "Sales Order":
                  response = await client.createSalesOrder(currentData);
                  break;
                case "Sales Invoice":
                  response = await client.createSalesInvoice(currentData);
                  break;
                case "Payment Entry":
                  response = await client.createPaymentEntry(currentData);
                  break;
                default:
                  return { success: false, error: `Unsupported module: ${module}` };
              }
              
              if (response.success) {
                console.log(`Auto-fix successful after ${attempt + 1} attempts`);
                return { 
                  success: true, 
                  data: response.data, 
                  fixesApplied 
                };
              } else {
                error = response.error || "Unknown error after fix attempt";
              }
            }
          } catch (fixError: any) {
            console.error(`Auto-fix strategy failed: ${fixError.message}`);
          }
        }
      }
    }
    
    return { 
      success: false, 
      error: `Auto-fix failed after ${maxRetries} attempts. Last error: ${error}`,
      fixesApplied 
    };
  }

  // Add new auto-fix strategy dynamically
  addStrategy(strategy: AutoFixStrategy) {
    this.strategies.push(strategy);
  }

  // Get all available strategies
  getStrategies(): AutoFixStrategy[] {
    return this.strategies.map(s => ({
      errorPattern: s.errorPattern,
      description: s.description,
      fix: s.fix
    }));
  }
}

export const autoFixMiddleware = new AutoFixMiddleware();
