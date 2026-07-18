import type { WorkSheet } from 'xlsx';

// ISO Date string aliases for self-documentation (e.g., "2026-07-18")
export type ISODate = string;
// ISO DateTime string aliases (e.g., "2026-07-18T18:00:00Z")
export type ISODateTime = string;
// ISO Time string aliases (e.g., "18:00:00")
export type ISOTime = string;

export interface DailyLog {
  id: string;
  date: ISODate;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Expense {
  id: string;
  date: ISODate;
  time: ISOTime;
  category: string;
  description: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  tags: string; // Comma or space separated
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // e.g., 'todo', 'in_progress', 'completed'
  priority: string; // e.g., 'low', 'medium', 'high'
  dueDate: ISODate;
  completedDate: ISODate;
  reminder: string;
  tags: string;
}

export interface Memory {
  id: string;
  date: ISODate;
  title: string;
  category: string;
  description: string;
  location: string;
  mood: string;
  favorite: boolean; // boolean parsed from cell
  tags: string;
}

export interface Collection {
  id: string;
  type: string;
  title: string;
  creator: string;
  rating: number; // numeric value
  status: string;
  notes: string;
  tags: string;
}

export interface CustomModule {
  id: string;
  name: string;
  icon: string;
  color: string;
  displayOrder: number;
}

export type FieldType = 'Text' | 'LongText' | 'Number' | 'Date' | 'Time' | 'Boolean' | 'Dropdown' | 'Rating';

export interface ModuleField {
  id: string;
  moduleId: string;
  fieldName: string;
  fieldType: FieldType;
  required: boolean; // boolean parsed from cell
  options: string[]; // parsed from JSON array string
  displayOrder: number;
}

export interface ModuleEntry {
  id: string;
  moduleId: string;
  date: ISODate;
  data: Record<string, unknown>; // parsed from JSON string with field IDs as keys
}

export interface UnknownWorksheet {
  name: string;
  sheet: WorkSheet;
}

export interface WorkbookData {
  dailyLogs: DailyLog[];
  expenses: Expense[];
  tasks: Task[];
  memories: Memory[];
  collections: Collection[];
  customModules: CustomModule[];
  moduleFields: ModuleField[];
  moduleEntries: ModuleEntry[];
  settings: Record<string, string>; // key-value maps
  metadata: Record<string, string>; // key-value maps
  unknownSheets: Record<string, WorkSheet>; // unrecognized worksheets preserved for round trips
}
