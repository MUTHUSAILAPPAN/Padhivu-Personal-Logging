export interface DailyLog {
  date: string; // YYYY-MM-DD
  rating: number; // 1-5 or 1-10
  notes: string;
  highlights: string[];
  productivity: number; // 1-5
  sleepHours?: number;
  mood?: string;
  tags?: string[];
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
  paymentMethod?: string;
  tags?: string[];
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'backlog';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  completedDate?: string; // YYYY-MM-DD
  tags?: string[];
}

export interface Memory {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
}

export interface CollectionItem {
  id: string;
  collectionName: string; // e.g., "Books To Read", "Movies Watched"
  title: string;
  dateAdded: string; // YYYY-MM-DD
  rating?: number;
  notes?: string;
  status?: string; // e.g., "Reading", "Completed", "Want to Watch"
  [key: string]: any; // Allow arbitrary fields for user customization
}

export interface CustomModuleField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select';
  options?: string[]; // For 'select' type
  required?: boolean;
}

export interface CustomModuleSchema {
  id: string;
  name: string;
  description?: string;
  fields: CustomModuleField[];
  icon?: string; // Lucide icon name
}

export interface CustomModuleData {
  schemaId: string;
  items: Array<{
    id: string;
    [key: string]: any;
  }>;
}

export interface WorkbookData {
  dailyLogs: DailyLog[];
  expenses: Expense[];
  tasks: Task[];
  memories: Memory[];
  collections: CollectionItem[];
  customModuleSchemas: CustomModuleSchema[];
  customModuleData: CustomModuleData[];
}
