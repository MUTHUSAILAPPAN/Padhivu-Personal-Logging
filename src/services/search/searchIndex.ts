import Fuse from 'fuse.js';
import type { WorkbookData } from '../../types';
import type { SearchableItem, SearchResult } from './searchTypes';

export class SearchIndex {
  private fuse: Fuse<SearchableItem> | null = null;

  public build(data: WorkbookData) {
    const items: SearchableItem[] = [];

    // 1. Map Tasks
    data.tasks.forEach((t) => {
      items.push({
        id: t.id,
        entityType: 'Task',
        title: t.title,
        subtitle: t.description || '',
        date: t.dueDate,
        route: '/app/tasks',
        searchContent: `Title: ${t.title} Description: ${t.description} Status: ${t.status} Priority: ${t.priority} Tags: ${t.tags}`
      });
    });

    // 2. Map Expenses
    data.expenses.forEach((e) => {
      items.push({
        id: e.id,
        entityType: 'Expense',
        title: e.category,
        subtitle: e.description || '',
        date: e.date,
        route: '/app/expenses',
        searchContent: `Category: ${e.category} Description: ${e.description} Notes: ${e.notes} PaymentMethod: ${e.paymentMethod} Amount: ${e.amount} Currency: ${e.currency} Tags: ${e.tags}`
      });
    });

    // 3. Map Memories
    data.memories.forEach((m) => {
      items.push({
        id: m.id,
        entityType: 'Memory',
        title: m.title,
        subtitle: m.description || '',
        date: m.date,
        route: '/app/memories',
        searchContent: `Title: ${m.title} Category: ${m.category} Description: ${m.description} Location: ${m.location} Mood: ${m.mood} Tags: ${m.tags}`
      });
    });

    // 4. Map Collections
    data.collections.forEach((c) => {
      items.push({
        id: c.id,
        entityType: 'Collection',
        title: c.title,
        subtitle: c.notes || '',
        route: '/app/collections',
        searchContent: `Title: ${c.title} Type: ${c.type} Creator: ${c.creator} Notes: ${c.notes} Status: ${c.status} Tags: ${c.tags}`
      });
    });

    // 5. Map CustomModules
    data.customModules.forEach((m) => {
      items.push({
        id: m.id,
        entityType: 'CustomModule',
        title: m.name,
        subtitle: 'Module configuration settings',
        route: '/app/modules',
        searchContent: `Custom Module Name: ${m.name} Icon: ${m.icon} Color: ${m.color}`
      });
    });

    // 6. Map ModuleEntries
    const fieldsMap = new Map(data.moduleFields.map((f) => [f.id, f]));
    const modulesMap = new Map(data.customModules.map((m) => [m.id, m]));

    data.moduleEntries.forEach((entry) => {
      const mod = modulesMap.get(entry.moduleId);
      const modName = mod ? mod.name : 'Custom Module';

      const details: string[] = [];
      Object.entries(entry.data).forEach(([fieldId, val]) => {
        const field = fieldsMap.get(fieldId);
        const fieldName = field ? field.fieldName : 'Field';
        const formattedVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        details.push(`${fieldName}: ${formattedVal}`);
      });

      const detailText = details.join(', ');

      items.push({
        id: entry.id,
        entityType: 'ModuleEntry',
        title: `${modName} Entry`,
        subtitle: `Recorded on ${entry.date}`,
        date: entry.date,
        route: `/app/modules`,
        searchContent: `Module Name: ${modName} Date: ${entry.date} Data: ${detailText}`
      });
    });

    this.fuse = new Fuse<SearchableItem>(items, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'searchContent', weight: 0.4 },
        { name: 'subtitle', weight: 0.1 }
      ],
      threshold: 0.3,
      ignoreLocation: true,
      includeMatches: true
    });
  }

  public search(query: string): SearchResult[] {
    if (!this.fuse || !query || query.trim() === '') {
      return [];
    }

    const results = this.fuse.search(query);
    return results.map((res) => {
      const { item, matches } = res;
      
      let matchedText = '';
      if (matches && matches.length > 0) {
        const contentMatch = matches.find((m) => m.key === 'searchContent');
        if (contentMatch && contentMatch.value) {
          const val = contentMatch.value;
          const indices = contentMatch.indices[0]; 
          const start = Math.max(0, indices[0] - 20);
          const end = Math.min(val.length, indices[1] + 20);
          const prefix = start > 0 ? '...' : '';
          const suffix = end < val.length ? '...' : '';
          matchedText = `${prefix}${val.substring(start, end)}${suffix}`;
        }
      }

      return {
        id: item.id,
        entityType: item.entityType,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        route: item.route,
        matchedText: matchedText || item.subtitle
      };
    });
  }
}
export type { SearchableItem, SearchResult };
