export const SCHEMA_VERSION = '1';

export const SHEET_NAMES = {
  DAILY_LOGS: 'DailyLogs',
  EXPENSES: 'Expenses',
  TASKS: 'Tasks',
  MEMORIES: 'Memories',
  COLLECTIONS: 'Collections',
  CUSTOM_MODULES: 'CustomModules',
  MODULE_FIELDS: 'ModuleFields',
  MODULE_ENTRIES: 'ModuleEntries',
  SETTINGS: 'Settings',
  METADATA: 'Metadata'
} as const;

export type SheetName = typeof SHEET_NAMES[keyof typeof SHEET_NAMES];

export const SHEET_HEADERS: Record<SheetName, string[]> = {
  [SHEET_NAMES.DAILY_LOGS]: ['id', 'date', 'createdAt', 'updatedAt'],
  [SHEET_NAMES.EXPENSES]: ['id', 'date', 'time', 'category', 'description', 'paymentMethod', 'amount', 'currency', 'tags', 'notes'],
  [SHEET_NAMES.TASKS]: ['id', 'title', 'description', 'status', 'priority', 'dueDate', 'completedDate', 'reminder', 'tags'],
  [SHEET_NAMES.MEMORIES]: ['id', 'date', 'title', 'category', 'description', 'location', 'mood', 'favorite', 'tags'],
  [SHEET_NAMES.COLLECTIONS]: ['id', 'type', 'title', 'creator', 'rating', 'status', 'notes', 'tags'],
  [SHEET_NAMES.CUSTOM_MODULES]: ['id', 'name', 'icon', 'color', 'displayOrder'],
  [SHEET_NAMES.MODULE_FIELDS]: ['id', 'moduleId', 'fieldName', 'fieldType', 'required', 'options', 'displayOrder'],
  [SHEET_NAMES.MODULE_ENTRIES]: ['id', 'moduleId', 'date', 'data'],
  [SHEET_NAMES.SETTINGS]: ['key', 'value'],
  [SHEET_NAMES.METADATA]: ['key', 'value']
};

export const SUPPORTED_FIELD_TYPES = [
  'Text',
  'LongText',
  'Number',
  'Date',
  'Time',
  'Boolean',
  'Dropdown',
  'Rating'
] as const;
