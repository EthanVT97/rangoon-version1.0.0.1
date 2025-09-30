
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
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
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

    data.forEach((record, index) => {
      rules.forEach(rule => {
        const value = record[rule.field];
        const rowNumber = index + 2; // Excel row number (accounting for header)

        // Check required fields
        if (rule.required && (value === null || value === undefined || value === '')) {
          errors.push({
            field: rule.field,
            message: `${rule.field} is required`,
            row: rowNumber
          });
          return;
        }

        // Skip validation if field is not required and empty
        if (!rule.required && (value === null || value === undefined || value === '')) {
          return;
        }

        // Type validation
        if (rule.type && !this.validateType(value, rule.type)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be of type ${rule.type}`,
            row: rowNumber
          });
        }

        // Length validation
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at least ${rule.minLength} characters`,
            row: rowNumber
          });
        }

        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must not exceed ${rule.maxLength} characters`,
            row: rowNumber
          });
        }

        // Pattern validation
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} format is invalid`,
            row: rowNumber
          });
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value)) && isFinite(Number(value));
      case 'date':
        return !isNaN(Date.parse(value));
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof value === 'string' && emailRegex.test(value);
      default:
        return true;
    }
  }
}

export const dataValidator = new DataValidator();
