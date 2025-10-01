// server/services/fieldMapper.ts
// Maps ERPNext's full field names to simple field names

export interface FieldMapping {
  erpnextField: string | string[]; // Can match multiple variations
  simpleField: string;
  transform?: (value: any) => any; // Optional transformation function
}

export class FieldMapper {
  private mappings: Record<string, FieldMapping[]> = {
    'Item': [
      {
        erpnextField: ['Item Code', 'item_code'],
        simpleField: 'item_code'
      },
      {
        erpnextField: ['Item Name', 'item_name'],
        simpleField: 'item_name'
      },
      {
        erpnextField: ['Item Group', 'item_group'],
        simpleField: 'item_group'
      },
      {
        erpnextField: ['Default Unit of Measure', 'stock_uom', 'Stock UOM'],
        simpleField: 'stock_uom'
      },
      {
        erpnextField: ['Description', 'description'],
        simpleField: 'description'
      },
      {
        erpnextField: ['Standard Rate', 'standard_rate', 'Rate'],
        simpleField: 'standard_rate',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Opening Stock', 'opening_stock'],
        simpleField: 'opening_stock',
        transform: (val) => val ? parseInt(val) : undefined
      },
      {
        erpnextField: ['Valuation Rate', 'valuation_rate'],
        simpleField: 'valuation_rate',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Maintain Stock', 'maintain_stock', 'is_stock_item'],
        simpleField: 'is_stock_item',
        transform: (val) => {
          if (typeof val === 'boolean') return val ? 1 : 0;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const lower = val.toLowerCase();
            return (lower === 'yes' || lower === '1' || lower === 'true') ? 1 : 0;
          }
          return 1; // Default to maintaining stock
        }
      },
      {
        erpnextField: ['Default Warehouse (Item Defaults)', 'default_warehouse'],
        simpleField: 'default_warehouse'
      },
      {
        erpnextField: ['Default Income Account (Item Defaults)', 'income_account'],
        simpleField: 'income_account'
      }
    ],
    
    'Customer': [
      {
        erpnextField: ['Customer Name', 'customer_name'],
        simpleField: 'customer_name'
      },
      {
        erpnextField: ['Customer Type', 'customer_type'],
        simpleField: 'customer_type'
      },
      {
        erpnextField: ['Customer Group', 'customer_group'],
        simpleField: 'customer_group'
      },
      {
        erpnextField: ['Territory', 'territory'],
        simpleField: 'territory'
      },
      {
        erpnextField: ['Mobile No', 'mobile_no', 'Mobile'],
        simpleField: 'mobile_no'
      },
      {
        erpnextField: ['Email Id', 'email_id', 'Email'],
        simpleField: 'email_id'
      }
    ],
    
    'Sales Order': [
      {
        erpnextField: ['Customer', 'customer'],
        simpleField: 'customer'
      },
      {
        erpnextField: ['Delivery Date', 'delivery_date'],
        simpleField: 'delivery_date',
        transform: (val) => this.normalizeDate(val)
      },
      {
        erpnextField: ['Item Code', 'item_code', 'Item Code (Items)'],
        simpleField: 'item_code'
      },
      {
        erpnextField: ['Qty', 'qty', 'Quantity', 'Quantity (Items)'],
        simpleField: 'qty',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Rate', 'rate', 'Rate (Items)'],
        simpleField: 'rate',
        transform: (val) => val ? parseFloat(val) : undefined
      }
    ],
    
    'Sales Invoice': [
      {
        erpnextField: ['Customer', 'customer'],
        simpleField: 'customer'
      },
      {
        erpnextField: ['Customer Name', 'customer_name'],
        simpleField: 'customer_name'
      },
      {
        erpnextField: ['ID', 'id'],
        simpleField: 'id'
      },
      {
        erpnextField: ['Company', 'company'],
        simpleField: 'company'
      },
      {
        erpnextField: ['Date', 'posting_date', 'Posting Date'],
        simpleField: 'posting_date',
        transform: (val) => this.normalizeDate(val)
      },
      {
        erpnextField: ['Payment Due Date', 'due_date', 'Due Date'],
        simpleField: 'due_date',
        transform: (val) => this.normalizeDate(val)
      },
      {
        erpnextField: ['Currency', 'currency'],
        simpleField: 'currency'
      },
      {
        erpnextField: ['Exchange Rate', 'exchange_rate'],
        simpleField: 'exchange_rate',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Cost Center (Items)', 'cost_center'],
        simpleField: 'cost_center'
      },
      {
        erpnextField: ['Item Name (Items)', 'Item Code', 'item_code'],
        simpleField: 'item_code'
      },
      {
        erpnextField: ['Quantity (Items)', 'Qty', 'qty', 'Quantity'],
        simpleField: 'qty',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Rate (Items)', 'Rate', 'rate'],
        simpleField: 'rate',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Income Account (Items)', 'income_account'],
        simpleField: 'income_account'
      },
      {
        erpnextField: ['Room', 'room'],
        simpleField: 'room',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Confirmation', 'confirmation'],
        simpleField: 'confirmation',
        transform: (val) => val ? parseFloat(val) : undefined
      }
    ],
    
    'Payment Entry': [
      {
        erpnextField: ['Payment Type', 'payment_type'],
        simpleField: 'payment_type'
      },
      {
        erpnextField: ['Party Type', 'party_type'],
        simpleField: 'party_type'
      },
      {
        erpnextField: ['Party', 'party'],
        simpleField: 'party'
      },
      {
        erpnextField: ['Posting Date', 'posting_date', 'Date'],
        simpleField: 'posting_date',
        transform: (val) => this.normalizeDate(val)
      },
      {
        erpnextField: ['Account Paid From', 'paid_from'],
        simpleField: 'paid_from'
      },
      {
        erpnextField: ['Account Paid To', 'paid_to'],
        simpleField: 'paid_to'
      },
      {
        erpnextField: ['Paid Amount', 'paid_amount'],
        simpleField: 'paid_amount',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Received Amount', 'received_amount'],
        simpleField: 'received_amount',
        transform: (val) => val ? parseFloat(val) : undefined
      },
      {
        erpnextField: ['Name (Payment References)', 'reference_name'],
        simpleField: 'reference_name'
      },
      {
        erpnextField: ['Type (Payment References)', 'reference_type'],
        simpleField: 'reference_type'
      },
      {
        erpnextField: ['Allocated (Payment References)', 'allocated_amount'],
        simpleField: 'allocated_amount',
        transform: (val) => val ? parseFloat(val) : undefined
      }
    ]
  };

  /**
   * Map Excel data from ERPNext field names to simple field names
   */
  mapData(module: string, data: Record<string, any>[]): Record<string, any>[] {
    const mappings = this.mappings[module];
    if (!mappings) {
      console.warn(`No field mappings defined for module: ${module}`);
      return data;
    }

    return data.map(row => {
      const mappedRow: Record<string, any> = {};
      
      // For each mapping rule
      for (const mapping of mappings) {
        const erpnextFields = Array.isArray(mapping.erpnextField) 
          ? mapping.erpnextField 
          : [mapping.erpnextField];
        
        // Try to find the value from any of the possible field names
        let value = undefined;
        for (const fieldName of erpnextFields) {
          if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
            value = row[fieldName];
            break;
          }
        }
        
        // Apply transformation if exists
        if (value !== undefined && mapping.transform) {
          try {
            value = mapping.transform(value);
          } catch (error) {
            console.warn(`Transform failed for ${mapping.simpleField}:`, error);
          }
        }
        
        // Only set if we found a value
        if (value !== undefined) {
          mappedRow[mapping.simpleField] = value;
        }
      }
      
      return mappedRow;
    });
  }

  /**
   * Normalize date to YYYY-MM-DD format
   */
  private normalizeDate(value: any): string | undefined {
    if (!value) return undefined;
    
    try {
      // If it's already in YYYY-MM-DD format
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      
      // Try to parse as date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get field mappings for a module (for documentation)
   */
  getMappings(module: string): FieldMapping[] | null {
    return this.mappings[module] || null;
  }

  /**
   * Check if a column name matches any known field
   */
  findMapping(module: string, columnName: string): FieldMapping | null {
    const mappings = this.mappings[module];
    if (!mappings) return null;

    for (const mapping of mappings) {
      const fields = Array.isArray(mapping.erpnextField) 
        ? mapping.erpnextField 
        : [mapping.erpnextField];
      
      if (fields.some(f => f.toLowerCase() === columnName.toLowerCase())) {
        return mapping;
      }
    }
    
    return null;
  }
}

export const fieldMapper = new FieldMapper();
