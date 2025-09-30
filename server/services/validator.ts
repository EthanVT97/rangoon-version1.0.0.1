export interface ValidationError {
  row: number;
  column: string;
  value: any;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface FieldRule {
  required?: boolean;
  type?: "string" | "number" | "boolean";
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export class DataValidator {
  private rules: Record<string, Record<string, FieldRule>> = {
    Item: {
      item_code: { required: true, type: "string" },
      item_name: { required: true, type: "string" },
      item_group: { required: true, type: "string" },
      stock_uom: { required: true, type: "string" },
    },
    Customer: {
      customer_name: { required: true, type: "string" },
      customer_type: { required: true, type: "string" },
      customer_group: { required: false, type: "string" },
      territory: { required: false, type: "string" },
    },
    "Sales Order": {
      customer: { required: true, type: "string" },
      delivery_date: { required: true, type: "string" },
      items: { required: true },
    },
    "Sales Invoice": {
      customer: { required: true, type: "string" },
      posting_date: { required: true, type: "string" },
      items: { required: true },
    },
    "Payment Entry": {
      payment_type: { required: true, type: "string" },
      party_type: { required: true, type: "string" },
      party: { required: true, type: "string" },
      paid_amount: { required: true, type: "number", minValue: 0 },
    },
  };

  validate(module: string, data: Record<string, any>[]): ValidationResult {
    const errors: ValidationError[] = [];
    const moduleRules = this.rules[module];

    if (!moduleRules) {
      return { isValid: true, errors: [] };
    }

    data.forEach((row, index) => {
      Object.entries(moduleRules).forEach(([field, rule]) => {
        const value = row[field];
        const rowNumber = index + 2; // Excel rows start at 1, header is row 1

        // Required field check
        if (rule.required && (value === null || value === undefined || value === "")) {
          errors.push({
            row: rowNumber,
            column: field,
            value,
            message: `${field} is required`,
          });
          return;
        }

        // Skip further validation if value is empty and not required
        if (!rule.required && (value === null || value === undefined || value === "")) {
          return;
        }

        // Type validation
        if (rule.type === "number") {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push({
              row: rowNumber,
              column: field,
              value,
              message: `${field} must be a number`,
            });
            return;
          }

          if (rule.minValue !== undefined && numValue < rule.minValue) {
            errors.push({
              row: rowNumber,
              column: field,
              value,
              message: `${field} must be at least ${rule.minValue}`,
            });
          }

          if (rule.maxValue !== undefined && numValue > rule.maxValue) {
            errors.push({
              row: rowNumber,
              column: field,
              value,
              message: `${field} must be at most ${rule.maxValue}`,
            });
          }
        }

        // Pattern validation
        if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
          errors.push({
            row: rowNumber,
            column: field,
            value,
            message: `${field} does not match required format`,
          });
        }

        // Custom validation
        if (rule.custom && !rule.custom(value)) {
          errors.push({
            row: rowNumber,
            column: field,
            value,
            message: `${field} failed custom validation`,
          });
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const dataValidator = new DataValidator();
