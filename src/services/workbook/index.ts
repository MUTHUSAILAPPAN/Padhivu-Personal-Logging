import type { WorkbookData } from '../../types';
import { parseWorkbook } from './workbookParser';
import { validateWorkbook } from './workbookValidator';
import type { ValidationError } from './workbookValidator';
import { exportWorkbook as writerExport } from './workbookWriter';
import { createStarterWorkbook as starterCreate } from './starterWorkbook';
import { migrateWorkbookData } from './migrations';

export interface ImportResult {
  data: WorkbookData;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const importWorkbook = (arrayBuffer: ArrayBuffer): ImportResult => {
  const parserResult = parseWorkbook(arrayBuffer);

  const parsedErrors: ValidationError[] = parserResult.errors.map((msg) => ({
    sheet: 'Workbook',
    message: msg,
    severity: 'error'
  }));

  const parsedWarnings: ValidationError[] = parserResult.warnings.map((msg) => ({
    sheet: 'Workbook',
    message: msg,
    severity: 'warning'
  }));

  if (parserResult.errors.length > 0) {
    return {
      data: parserResult.data,
      errors: parsedErrors,
      warnings: parsedWarnings
    };
  }

  // Determine original schema version (default to 1 if missing)
  const sourceVersionStr = parserResult.data.metadata.schemaVersion || '1';
  const sourceVersion = parseInt(sourceVersionStr, 10) || 1;

  // Run schema migrations
  let migratedData = parserResult.data;
  try {
    migratedData = migrateWorkbookData(parserResult.data, sourceVersion, 1); // target canonical version is 1
  } catch (error: any) {
    return {
      data: parserResult.data,
      errors: [
        ...parsedErrors,
        {
          sheet: 'Metadata',
          message: `Migration failed: ${error.message || 'Unknown error'}`,
          severity: 'error'
        }
      ],
      warnings: parsedWarnings
    };
  }

  // Validate the migrated data
  const validationResult = validateWorkbook(migratedData, parserResult.workbook);

  return {
    data: migratedData,
    errors: [...parsedErrors, ...validationResult.errors],
    warnings: [...parsedWarnings, ...validationResult.warnings]
  };
};

export const exportWorkbook = (data: WorkbookData): ArrayBuffer => {
  return writerExport(data);
};

export const createStarterWorkbook = (): ArrayBuffer => {
  return starterCreate();
};
export type { ValidationError };
