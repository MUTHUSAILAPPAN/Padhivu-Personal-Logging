import * as XLSX from 'xlsx';
import type { WorkbookData } from '../../types';
import { SHEET_NAMES, SHEET_HEADERS, SUPPORTED_FIELD_TYPES } from './constants';

export interface ValidationError {
  sheet: string;
  row?: number | string; // Row number (2-based for spreadsheet) or ID
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidISODate(val: string): boolean {
  if (!val) return false;
  if (!ISO_DATE_REGEX.test(val)) return false;
  const timestamp = Date.parse(val);
  return !isNaN(timestamp);
}

function isValidISODateTime(val: string): boolean {
  if (!val) return false;
  const timestamp = Date.parse(val);
  return !isNaN(timestamp);
}

function getSheetHeaders(sheet: XLSX.WorkSheet): string[] {
  const headers: string[] = [];
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
    const cell = sheet[cellAddress];
    headers.push(cell ? String(cell.v).trim() : '');
  }
  return headers;
}

export const validateWorkbook = (data: WorkbookData, rawWorkbook?: XLSX.WorkBook): { errors: ValidationError[]; warnings: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Helper to push error
  const addError = (sheet: string, message: string, row?: number | string, field?: string) => {
    errors.push({ sheet, message, row, field, severity: 'error' });
  };

  // Helper to push warning
  const addWarning = (sheet: string, message: string, row?: number | string, field?: string) => {
    warnings.push({ sheet, message, row, field, severity: 'warning' });
  };

  // 1. Validate Sheet Headers (if raw workbook is available)
  if (rawWorkbook) {
    Object.entries(SHEET_HEADERS).forEach(([sheetName, expectedHeaders]) => {
      const sheet = rawWorkbook.Sheets[sheetName];
      if (sheet) {
        const actualHeaders = getSheetHeaders(sheet);
        expectedHeaders.forEach((header) => {
          if (!actualHeaders.includes(header)) {
            addError(sheetName, `Missing required header column "${header}"`, 1, header);
          }
        });
      }
    });
  }

  // Helper to check unique IDs
  const checkUniqueIds = (items: { id: string }[], sheetName: string) => {
    const ids = new Set<string>();
    items.forEach((item, idx) => {
      if (ids.has(item.id)) {
        addError(sheetName, `Duplicate entity ID "${item.id}" detected`, idx + 2, 'id');
      } else {
        ids.add(item.id);
      }
    });
  };

  // 2. Validate IDs uniqueness
  checkUniqueIds(data.dailyLogs, SHEET_NAMES.DAILY_LOGS);
  checkUniqueIds(data.expenses, SHEET_NAMES.EXPENSES);
  checkUniqueIds(data.tasks, SHEET_NAMES.TASKS);
  checkUniqueIds(data.memories, SHEET_NAMES.MEMORIES);
  checkUniqueIds(data.collections, SHEET_NAMES.COLLECTIONS);
  checkUniqueIds(data.customModules, SHEET_NAMES.CUSTOM_MODULES);
  checkUniqueIds(data.moduleFields, SHEET_NAMES.MODULE_FIELDS);
  checkUniqueIds(data.moduleEntries, SHEET_NAMES.MODULE_ENTRIES);

  // Settings & Metadata Unique keys validation
  const settingsKeys = new Set<string>();
  Object.keys(data.settings).forEach((key) => {
    if (settingsKeys.has(key)) {
      addError(SHEET_NAMES.SETTINGS, `Duplicate settings key "${key}" detected`, key, 'key');
    }
    settingsKeys.add(key);
  });

  const metadataKeys = new Set<string>();
  Object.keys(data.metadata).forEach((key) => {
    if (metadataKeys.has(key)) {
      addError(SHEET_NAMES.METADATA, `Duplicate metadata key "${key}" detected`, key, 'key');
    }
    metadataKeys.add(key);
  });

  // 3. Validate Date format correctness
  data.dailyLogs.forEach((log, idx) => {
    if (!isValidISODate(log.date)) {
      addError(SHEET_NAMES.DAILY_LOGS, `Invalid date format "${log.date}". Must be ISO YYYY-MM-DD.`, idx + 2, 'date');
    }
    if (log.createdAt && !isValidISODateTime(log.createdAt)) {
      addWarning(SHEET_NAMES.DAILY_LOGS, `Invalid createdAt DateTime format "${log.createdAt}".`, idx + 2, 'createdAt');
    }
    if (log.updatedAt && !isValidISODateTime(log.updatedAt)) {
      addWarning(SHEET_NAMES.DAILY_LOGS, `Invalid updatedAt DateTime format "${log.updatedAt}".`, idx + 2, 'updatedAt');
    }
  });

  data.expenses.forEach((expense, idx) => {
    if (!isValidISODate(expense.date)) {
      addError(SHEET_NAMES.EXPENSES, `Invalid date format "${expense.date}". Must be ISO YYYY-MM-DD.`, idx + 2, 'date');
    }
  });

  data.tasks.forEach((task, idx) => {
    if (task.dueDate && !isValidISODate(task.dueDate)) {
      addError(SHEET_NAMES.TASKS, `Invalid dueDate format "${task.dueDate}". Must be ISO YYYY-MM-DD.`, idx + 2, 'dueDate');
    }
    if (task.completedDate && !isValidISODate(task.completedDate)) {
      addError(SHEET_NAMES.TASKS, `Invalid completedDate format "${task.completedDate}". Must be ISO YYYY-MM-DD.`, idx + 2, 'completedDate');
    }
  });

  data.memories.forEach((memory, idx) => {
    if (!isValidISODate(memory.date)) {
      addError(SHEET_NAMES.MEMORIES, `Invalid date format "${memory.date}". Must be ISO YYYY-MM-DD.`, idx + 2, 'date');
    }
  });

  data.moduleEntries.forEach((entry, idx) => {
    if (!isValidISODate(entry.date)) {
      addError(SHEET_NAMES.MODULE_ENTRIES, `Invalid date format "${entry.date}". Must be ISO YYYY-MM-DD.`, idx + 2, 'date');
    }
  });

  // 4. Validate foreign key references
  const validModuleIds = new Set(data.customModules.map((m) => m.id));

  data.moduleFields.forEach((field, idx) => {
    if (!validModuleIds.has(field.moduleId)) {
      addError(
        SHEET_NAMES.MODULE_FIELDS,
        `Field references unknown CustomModule ID "${field.moduleId}"`,
        idx + 2,
        'moduleId'
      );
    }
    
    // Validate field types
    if (!SUPPORTED_FIELD_TYPES.includes(field.fieldType as any)) {
      addError(
        SHEET_NAMES.MODULE_FIELDS,
        `Unsupported fieldType value "${field.fieldType}".`,
        idx + 2,
        'fieldType'
      );
    }

    // Validate dropdown has options
    if (field.fieldType === 'Dropdown' && (!field.options || field.options.length === 0)) {
      addError(
        SHEET_NAMES.MODULE_FIELDS,
        `Dropdown field "${field.fieldName}" is missing configuration options.`,
        idx + 2,
        'options'
      );
    }
  });

  data.moduleEntries.forEach((entry, idx) => {
    if (!validModuleIds.has(entry.moduleId)) {
      addError(
        SHEET_NAMES.MODULE_ENTRIES,
        `Entry references unknown CustomModule ID "${entry.moduleId}"`,
        idx + 2,
        'moduleId'
      );
    }
  });

  // 5. Validate module entries data keys against module fields and validate ratings
  const fieldsByModuleId: Record<string, Record<string, typeof data.moduleFields[0]>> = {};
  data.moduleFields.forEach((field) => {
    if (!fieldsByModuleId[field.moduleId]) {
      fieldsByModuleId[field.moduleId] = {};
    }
    fieldsByModuleId[field.moduleId][field.id] = field;
  });

  data.moduleEntries.forEach((entry, idx) => {
    const moduleFields = fieldsByModuleId[entry.moduleId] || {};
    const dataKeys = Object.keys(entry.data);

    dataKeys.forEach((key) => {
      const fieldDef = moduleFields[key];
      if (!fieldDef) {
        addWarning(
          SHEET_NAMES.MODULE_ENTRIES,
          `Entry contains value for field ID "${key}" not defined in CustomModule fields list.`,
          idx + 2,
          'data'
        );
        return;
      }

      const val = entry.data[key];

      // Validate Rating range
      if (fieldDef.fieldType === 'Rating') {
        const numericVal = Number(val);
        if (isNaN(numericVal) || numericVal < 1 || numericVal > 5) {
          addError(
            SHEET_NAMES.MODULE_ENTRIES,
            `Rating field value "${val}" is out of bounds. Must be a number between 1 and 5.`,
            idx + 2,
            'data'
          );
        }
      }

      // Validate Boolean type
      if (fieldDef.fieldType === 'Boolean') {
        if (typeof val !== 'boolean') {
          addWarning(
            SHEET_NAMES.MODULE_ENTRIES,
            `Field expected type Boolean but received "${typeof val}".`,
            idx + 2,
            'data'
          );
        }
      }

      // Validate Number type
      if (fieldDef.fieldType === 'Number') {
        if (typeof val !== 'number' && isNaN(Number(val))) {
          addError(
            SHEET_NAMES.MODULE_ENTRIES,
            `Field expected type Number but received non-numeric value "${val}".`,
            idx + 2,
            'data'
          );
        }
      }
    });

    // Check required fields are present
    Object.values(moduleFields).forEach((field) => {
      if (field.required && (entry.data[field.id] === undefined || entry.data[field.id] === null || entry.data[field.id] === '')) {
        addError(
          SHEET_NAMES.MODULE_ENTRIES,
          `Required field "${field.fieldName}" (ID: ${field.id}) is missing from entry data.`,
          idx + 2,
          'data'
        );
      }
    });
  });

  return {
    errors,
    warnings
  };
};
