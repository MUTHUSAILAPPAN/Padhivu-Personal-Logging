// Workbook parsing and serialization service placeholder
// Excel sheets will be parsed and written back using SheetJS (xlsx)

import type { WorkbookData } from '../../types';

export const parseWorkbook = async (_file: File): Promise<WorkbookData> => {
  // Parsing logic will go here
  throw new Error('Not implemented');
};

export const exportWorkbook = async (_data: WorkbookData): Promise<Blob> => {
  // Export logic will go here
  throw new Error('Not implemented');
};

