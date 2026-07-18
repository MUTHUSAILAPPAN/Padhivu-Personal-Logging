import * as XLSX from 'xlsx';
import type { WorkbookData } from '../../types';
import { SHEET_NAMES, SHEET_HEADERS, SCHEMA_VERSION } from './constants';

function tableToSheet<T>(
  items: T[], 
  headers: string[], 
  rowMapper: (item: T) => any[]
): XLSX.WorkSheet {
  const aoa: any[][] = [headers];
  items.forEach((item) => {
    aoa.push(rowMapper(item));
  });
  return XLSX.utils.aoa_to_sheet(aoa);
}

export const exportWorkbook = (data: WorkbookData): ArrayBuffer => {
  const wb = XLSX.utils.book_new();

  // Create an updated copy of metadata
  const finalMetadata = {
    ...data.metadata,
    updatedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION
  };

  // 1. DailyLogs
  const wsLogs = tableToSheet(
    data.dailyLogs, 
    SHEET_HEADERS[SHEET_NAMES.DAILY_LOGS], 
    (item) => [item.id, item.date, item.createdAt, item.updatedAt]
  );
  XLSX.utils.book_append_sheet(wb, wsLogs, SHEET_NAMES.DAILY_LOGS);

  // 2. Expenses
  const wsExpenses = tableToSheet(
    data.expenses, 
    SHEET_HEADERS[SHEET_NAMES.EXPENSES], 
    (item) => [
      item.id, 
      item.date, 
      item.time, 
      item.category, 
      item.description, 
      item.paymentMethod, 
      item.amount, // written as numeric
      item.currency, 
      item.tags, 
      item.notes
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsExpenses, SHEET_NAMES.EXPENSES);

  // 3. Tasks
  const wsTasks = tableToSheet(
    data.tasks, 
    SHEET_HEADERS[SHEET_NAMES.TASKS], 
    (item) => [
      item.id, 
      item.title, 
      item.description, 
      item.status, 
      item.priority, 
      item.dueDate, 
      item.completedDate, 
      item.reminder, 
      item.tags
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsTasks, SHEET_NAMES.TASKS);

  // 4. Memories
  const wsMemories = tableToSheet(
    data.memories, 
    SHEET_HEADERS[SHEET_NAMES.MEMORIES], 
    (item) => [
      item.id, 
      item.date, 
      item.title, 
      item.category, 
      item.description, 
      item.location, 
      item.mood, 
      item.favorite, // written as boolean
      item.tags
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsMemories, SHEET_NAMES.MEMORIES);

  // 5. Collections
  const wsCollections = tableToSheet(
    data.collections, 
    SHEET_HEADERS[SHEET_NAMES.COLLECTIONS], 
    (item) => [
      item.id, 
      item.type, 
      item.title, 
      item.creator, 
      item.rating, // written as numeric
      item.status, 
      item.notes, 
      item.tags
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsCollections, SHEET_NAMES.COLLECTIONS);

  // 6. CustomModules
  const wsModules = tableToSheet(
    data.customModules, 
    SHEET_HEADERS[SHEET_NAMES.CUSTOM_MODULES], 
    (item) => [
      item.id, 
      item.name, 
      item.icon, 
      item.color, 
      item.displayOrder // written as numeric
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsModules, SHEET_NAMES.CUSTOM_MODULES);

  // 7. ModuleFields
  const wsFields = tableToSheet(
    data.moduleFields, 
    SHEET_HEADERS[SHEET_NAMES.MODULE_FIELDS], 
    (item) => [
      item.id, 
      item.moduleId, 
      item.fieldName, 
      item.fieldType, 
      item.required, // written as boolean
      JSON.stringify(item.options), // written as serialized string JSON
      item.displayOrder // written as numeric
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsFields, SHEET_NAMES.MODULE_FIELDS);

  // 8. ModuleEntries
  const wsEntries = tableToSheet(
    data.moduleEntries, 
    SHEET_HEADERS[SHEET_NAMES.MODULE_ENTRIES], 
    (item) => [
      item.id, 
      item.moduleId, 
      item.date, 
      JSON.stringify(item.data) // written as serialized string JSON
    ]
  );
  XLSX.utils.book_append_sheet(wb, wsEntries, SHEET_NAMES.MODULE_ENTRIES);

  // 9. Settings
  const settingsRows = [SHEET_HEADERS[SHEET_NAMES.SETTINGS]];
  Object.entries(data.settings).forEach(([key, value]) => {
    settingsRows.push([key, value]);
  });
  const wsSettings = XLSX.utils.aoa_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, SHEET_NAMES.SETTINGS);

  // 10. Metadata
  const metadataRows = [SHEET_HEADERS[SHEET_NAMES.METADATA]];
  Object.entries(finalMetadata).forEach(([key, value]) => {
    metadataRows.push([key, value]);
  });
  const wsMetadata = XLSX.utils.aoa_to_sheet(metadataRows);
  XLSX.utils.book_append_sheet(wb, wsMetadata, SHEET_NAMES.METADATA);

  // 11. Preserve and append unknown sheets
  Object.entries(data.unknownSheets).forEach(([sheetName, sheet]) => {
    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
  });

  // Write out the sheet files as array
  const wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  const u8Array = XLSX.write(wb, wopts);
  
  return u8Array instanceof ArrayBuffer 
    ? u8Array 
    : (u8Array as any).buffer || u8Array;
};
