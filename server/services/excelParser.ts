import * as XLSX from "xlsx";

export interface ParsedExcelData {
  data: Record<string, any>[];
  rowCount: number;
  columns: string[];
}

export class ExcelParser {
  parseFile(buffer: Buffer): ParsedExcelData {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: null 
    }) as Record<string, any>[];

    const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

    return {
      data: jsonData,
      rowCount: jsonData.length,
      columns,
    };
  }

  generateTemplate(module: string, columns: string[], sampleData?: Record<string, any>[]): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(sampleData || [{}], { 
      header: columns 
    });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, module);
    
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }
}

export const excelParser = new ExcelParser();
