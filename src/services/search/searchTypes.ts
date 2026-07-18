export interface SearchResult {
  id: string;
  entityType: 'Task' | 'Expense' | 'Memory' | 'Collection' | 'CustomModule' | 'ModuleEntry';
  title: string;
  subtitle: string;
  date?: string;
  route: string;
  matchedText?: string; // Highlight friendly matched segment
}

export interface SearchableItem {
  id: string;
  entityType: 'Task' | 'Expense' | 'Memory' | 'Collection' | 'CustomModule' | 'ModuleEntry';
  title: string;
  subtitle: string;
  date?: string;
  route: string;
  searchContent: string; // Aggregate of searchable text fields
}
