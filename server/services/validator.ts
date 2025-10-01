// server/services/validator.ts - Improved version with better error messages

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'date' | 'email';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

interface ValidationError {
  field: string;
  message: string;
  row?: number;
  value?: any;
  expectedType?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

class DataValidator {
  private validationRules: Record<string, ValidationRule[]> = {
    'Item': [
      { field: 'item_code', required: true, type: 'string', minLength: 1 },
      { field: 'item_name', required: true, type: 'string', minLength: 1 },
      { field: 'item_group', required: true, type: 'string' },
      { field: 'stock_uom', required: true, type: 'string' },
      { field: 'standard_rate', type: 'number' },
      { field: 'opening_stock', type: 'number' },
      { field: 'valuation_rate', type: 'number' }
    ],
    'Customer': [
      { field: 'customer_name', required: true, type: 'string', minLength: 1 },
      { field: 'customer_type', required: true, type: 'string' },
      { field: 'customer_group', required: true, type: 'string' },
      { field: 'territory', required: true, type: 'string' },
      { field: 'email_id', type: 'email' },
      { field: 'mobile_no', type: 'string' }
    ],
    'Sales Order': [
      { field: 'customer', required: true, type: 'string' },
      { field: 'delivery_date', required: true, type: 'date' },
      { field: 'item_code', required: true, type: 'string' },
      { field: 'qty', required: true, type: 'number' },
      { field: 'rate', required: true, type: 'number' }
    ],
    'Sales Invoice': [
      { field: 'customer', required: true, type: 'string' },
      { field: 'due_date', type: 'date' },
      { field: 'item_code', required: true, type: 'string' },
      { field: 'qty', required: true, type: 'number' },
      { field: 'rate', required: true, type: 'number' }
    ],
    'Payment Entry': [
      { field: 'payment_type', required: true, type: 'string' },
      { field: 'party_type', required: true, type: 'string' },
      { field: 'party', required: true, type: 'string' },
      { field: 'paid_amount', required: true, type: 'number' },
      { field: 'received_amount', required: true, type: 'number' }
    ]
  };

  validate(module: string, data: Record<string, any>[]): ValidationResult {
    const rules = this.validationRules[module];
    if (!rules) {
      return {
        isValid: false,
        errors: [{ field: 'module', message: `Unsupported module: ${module}` }]
      };
    }

    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check if data is empty
    if (!data || data.length === 0) {
      return {
        isValid: false,
        errors: [{ field: 'data', message: 'No data found in the Excel file. Make sure your sheet has data rows.' }]
      };
    }

    // Get all column names from the first row
    const actualColumns = Object.keys(data[0] || {});
    const expectedColumns = rules.map(r => r.field);
    const requiredColumns = rules.filter(r => r.required).map(r => r.field);

    // Check for missing required columns
    const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col));
    if (missingColumns.length > 0) {
      errors.push({
        field: 'columns',
        message: `Missing required columns: ${missingColumns.join(', ')}. Expected columns: ${requiredColumns.join(', ')}`,
      });
    }

    // Check for extra columns (just a warning)
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
    if (extraColumns.length > 0) {
      warnings.push(`Extra columns found (will be ignored): ${extraColumns.join(', ')}`);
    }

    // Validate each record
    data.forEach((record, index) => {
      rules.forEach(rule => {
        const value = record[rule.field];
        const rowNumber = index + 2; // Excel row number (accounting for header)

        // Check required fields
        if (rule.required && (value === null || value === undefined || value === '')) {
          errors.push({
            field: rule.field,
            message: `Required field '${rule.field}' is missing or empty`,
            row: rowNumber,
            value: value,
            expectedType: rule.type
          });
          return;
        }

        // Skip validation if field is not required and empty
        if (!rule.required && (value === null || value === undefined || value === '')) {
          return;
        }

        // Type validation with helpful messages
        if (rule.type) {
          const typeValid = this.validateType(value, rule.type);
          if (!typeValid.isValid) {
            errors.push({
              field: rule.field,
              message: `Field '${rule.field}' has invalid type. ${typeValid.message}`,
              row: rowNumber,
              value: value,
              expectedType: rule.type
            });
          }
        }

        // Length validation
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push({
            field: rule.field,
            message: `Field '${rule.field}' must be at least ${rule.minLength} characters (got ${value.length})`,
            row: rowNumber,
            value: value
          });
        }

        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push({
            field: rule.field,
            message: `Field '${rule.field}' must not exceed ${rule.maxLength} characters (got ${value.length})`,
            row: rowNumber,
            value: value
          });
        }

        // Pattern validation
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push({
            field: rule.field,
            message: `Field '${rule.field}' format is invalid`,
            row: rowNumber,
            value: value
          });
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private validateType(value: any, type: string): { isValid: boolean; message?: string } {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { 
            isValid: false, 
            message: `Expected text, got ${typeof value}. Value: "${value}"` 
          };
        }
        return { isValid: true };
        
      case 'number':
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
          return { 
            isValid: false, 
            message: `Expected a number, got "${value}". Make sure cells are formatted as numbers, not text.` 
          };
        }
        return { isValid: true };
        
      case 'date':
        const dateValid = !isNaN(Date.parse(value));
        if (!dateValid) {
          return { 
            isValid: false, 
            message: `Expected a date in format YYYY-MM-DD (e.g., 2025-10-31), got "${value}"` 
          };
        }
        return { isValid: true };
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          return { 
            isValid: false, 
            message: `Expected a valid email address, got "${value}"` 
          };
        }
        return { isValid: true };
        
      default:
        return { isValid: true };
    }
  }

  // Helper method to get expected format for a module
  getExpectedFormat(module: string): string[] | null {
    const rules = this.validationRules[module];
    if (!rules) return null;
    
    return rules.map(rule => {
      let format = rule.field;
      if (rule.required) format += ' (required)';
      if (rule.type) format += ` [${rule.type}]`;
      return format;
    });
  }
}

export const dataValidator = new DataValidator();
