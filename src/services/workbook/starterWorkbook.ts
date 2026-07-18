import type { WorkbookData } from '../../types';
import { exportWorkbook } from './workbookWriter';
import { SCHEMA_VERSION } from './constants';

export const createStarterWorkbook = (): ArrayBuffer => {
  const now = new Date().toISOString();
  
  const initialData: WorkbookData = {
    dailyLogs: [],
    expenses: [],
    tasks: [],
    memories: [],
    collections: [],
    customModules: [],
    moduleFields: [],
    moduleEntries: [],
    settings: {
      theme: 'light',
      accent: 'emerald',
      currency: 'USD',
      language: 'en',
      dateFormat: 'yyyy-MM-dd',
      weekStart: '1' // 1 = Monday
    },
    metadata: {
      workbookVersion: '1.0',
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      appVersion: '1.0.0'
    },
    unknownSheets: {}
  };

  return exportWorkbook(initialData);
};
