import * as XLSX from 'xlsx';
import type { 
  WorkbookData, 
  FieldType
} from '../../types';
import { SHEET_NAMES } from './constants';

export interface ParseResult {
  data: WorkbookData;
  warnings: string[];
  errors: string[];
  workbook?: XLSX.WorkBook;
}

function parseBool(val: any): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes' || s === 'y';
  }
  return false;
}

function parseNum(val: any, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'number') return val;
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
}

function parseJSON<T>(val: any, fallback: T, onWarning: (msg: string) => void): T {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'object') return val as T;
  try {
    return JSON.parse(val) as T;
  } catch (error: any) {
    onWarning(`Malformed JSON string: "${val}". Details: ${error.message}`);
    return fallback;
  }
}

export const parseWorkbook = (arrayBuffer: ArrayBuffer): ParseResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  } catch (error: any) {
    return {
      data: {
        dailyLogs: [],
        expenses: [],
        tasks: [],
        memories: [],
        collections: [],
        customModules: [],
        moduleFields: [],
        moduleEntries: [],
        settings: {},
        metadata: {},
        unknownSheets: {}
      },
      warnings: [],
      errors: [`Failed to open workbook file: ${error.message || 'Unknown error'}`]
    };
  }

  const data: WorkbookData = {
    dailyLogs: [],
    expenses: [],
    tasks: [],
    memories: [],
    collections: [],
    customModules: [],
    moduleFields: [],
    moduleEntries: [],
    settings: {},
    metadata: {},
    unknownSheets: {}
  };

  // Helper to read rows from a sheet
  const getSheetRows = (sheetName: string): any[] => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      warnings.push(`Optional sheet "${sheetName}" is missing. Initializing as empty.`);
      return [];
    }
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  };

  // 1. DailyLogs
  const rawLogs = getSheetRows(SHEET_NAMES.DAILY_LOGS);
  rawLogs.forEach((row, idx) => {
    if (!row.id || !row.date) {
      warnings.push(`DailyLogs: Skipped row ${idx + 2} because required 'id' or 'date' is empty.`);
      return;
    }
    data.dailyLogs.push({
      id: String(row.id).trim(),
      date: String(row.date).trim(),
      createdAt: String(row.createdAt).trim(),
      updatedAt: String(row.updatedAt).trim()
    });
  });

  // 2. Expenses
  const rawExpenses = getSheetRows(SHEET_NAMES.EXPENSES);
  rawExpenses.forEach((row, idx) => {
    if (!row.id || !row.date) {
      warnings.push(`Expenses: Skipped row ${idx + 2} because required 'id' or 'date' is empty.`);
      return;
    }
    data.expenses.push({
      id: String(row.id).trim(),
      date: String(row.date).trim(),
      time: String(row.time).trim(),
      category: String(row.category).trim(),
      description: String(row.description).trim(),
      paymentMethod: String(row.paymentMethod).trim(),
      amount: parseNum(row.amount),
      currency: String(row.currency).trim(),
      tags: String(row.tags).trim(),
      notes: String(row.notes).trim()
    });
  });

  // 3. Tasks
  const rawTasks = getSheetRows(SHEET_NAMES.TASKS);
  rawTasks.forEach((row, idx) => {
    if (!row.id || !row.title) {
      warnings.push(`Tasks: Skipped row ${idx + 2} because required 'id' or 'title' is empty.`);
      return;
    }
    data.tasks.push({
      id: String(row.id).trim(),
      title: String(row.title).trim(),
      description: String(row.description).trim(),
      status: String(row.status).trim(),
      priority: String(row.priority).trim(),
      dueDate: String(row.dueDate).trim(),
      completedDate: String(row.completedDate).trim(),
      reminder: String(row.reminder).trim(),
      tags: String(row.tags).trim()
    });
  });

  // 4. Memories
  const rawMemories = getSheetRows(SHEET_NAMES.MEMORIES);
  rawMemories.forEach((row, idx) => {
    if (!row.id || !row.date || !row.title) {
      warnings.push(`Memories: Skipped row ${idx + 2} because required 'id', 'date' or 'title' is empty.`);
      return;
    }
    data.memories.push({
      id: String(row.id).trim(),
      date: String(row.date).trim(),
      title: String(row.title).trim(),
      category: String(row.category).trim(),
      description: String(row.description).trim(),
      location: String(row.location).trim(),
      mood: String(row.mood).trim(),
      favorite: parseBool(row.favorite),
      tags: String(row.tags).trim()
    });
  });

  // 5. Collections
  const rawCollections = getSheetRows(SHEET_NAMES.COLLECTIONS);
  rawCollections.forEach((row, idx) => {
    if (!row.id || !row.type || !row.title) {
      warnings.push(`Collections: Skipped row ${idx + 2} because required 'id', 'type' or 'title' is empty.`);
      return;
    }
    data.collections.push({
      id: String(row.id).trim(),
      type: String(row.type).trim(),
      title: String(row.title).trim(),
      creator: String(row.creator).trim(),
      rating: parseNum(row.rating),
      status: String(row.status).trim(),
      notes: String(row.notes).trim(),
      tags: String(row.tags).trim()
    });
  });

  // 6. CustomModules
  const rawModules = getSheetRows(SHEET_NAMES.CUSTOM_MODULES);
  rawModules.forEach((row, idx) => {
    if (!row.id || !row.name) {
      warnings.push(`CustomModules: Skipped row ${idx + 2} because required 'id' or 'name' is empty.`);
      return;
    }
    data.customModules.push({
      id: String(row.id).trim(),
      name: String(row.name).trim(),
      icon: String(row.icon).trim(),
      color: String(row.color).trim(),
      displayOrder: parseNum(row.displayOrder)
    });
  });

  // 7. ModuleFields
  const rawFields = getSheetRows(SHEET_NAMES.MODULE_FIELDS);
  rawFields.forEach((row, idx) => {
    if (!row.id || !row.moduleId || !row.fieldName || !row.fieldType) {
      warnings.push(`ModuleFields: Skipped row ${idx + 2} because required 'id', 'moduleId', 'fieldName', or 'fieldType' is empty.`);
      return;
    }
    data.moduleFields.push({
      id: String(row.id).trim(),
      moduleId: String(row.moduleId).trim(),
      fieldName: String(row.fieldName).trim(),
      fieldType: String(row.fieldType).trim() as FieldType,
      required: parseBool(row.required),
      options: parseJSON<string[]>(row.options, [], (msg) => 
        warnings.push(`ModuleFields: Row ${idx + 2} options: ${msg}`)
      ),
      displayOrder: parseNum(row.displayOrder)
    });
  });

  // 8. ModuleEntries
  const rawEntries = getSheetRows(SHEET_NAMES.MODULE_ENTRIES);
  rawEntries.forEach((row, idx) => {
    if (!row.id || !row.moduleId || !row.date) {
      warnings.push(`ModuleEntries: Skipped row ${idx + 2} because required 'id', 'moduleId', or 'date' is empty.`);
      return;
    }
    data.moduleEntries.push({
      id: String(row.id).trim(),
      moduleId: String(row.moduleId).trim(),
      date: String(row.date).trim(),
      data: parseJSON<Record<string, unknown>>(row.data, {}, (msg) => 
        warnings.push(`ModuleEntries: Row ${idx + 2} data: ${msg}`)
      )
    });
  });

  // 9. Settings
  const rawSettings = getSheetRows(SHEET_NAMES.SETTINGS);
  rawSettings.forEach((row) => {
    if (row.key !== undefined && row.key !== null && row.key !== '') {
      data.settings[String(row.key).trim()] = String(row.value);
    }
  });

  // 10. Metadata
  const rawMetadata = getSheetRows(SHEET_NAMES.METADATA);
  rawMetadata.forEach((row) => {
    if (row.key !== undefined && row.key !== null && row.key !== '') {
      data.metadata[String(row.key).trim()] = String(row.value);
    }
  });

  // 11. Preserve unknown sheets
  const canonicalSheetNamesSet = new Set(Object.values(SHEET_NAMES));
  workbook.SheetNames.forEach((sheetName) => {
    if (!canonicalSheetNamesSet.has(sheetName as any)) {
      data.unknownSheets[sheetName] = workbook.Sheets[sheetName];
    }
  });

  return {
    data,
    warnings,
    errors,
    workbook
  };
};
