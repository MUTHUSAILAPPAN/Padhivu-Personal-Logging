import type { WorkbookData } from '../types';
import type { ValidationError } from '../services/workbook';

export interface WorkbookState {
  workbookData: WorkbookData | null;
  workbookName: string | null;
  fileHandle: FileSystemFileHandle | null;
  importStatus: 'idle' | 'loading' | 'ready' | 'error';
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  importErrors: ValidationError[];
  importWarnings: ValidationError[];
  dirty: boolean;
  lastSavedAt: string | null;
}

export type WorkbookAction =
  | { 
      type: 'SET_LOADED_WORKBOOK'; 
      payload: { 
        data: WorkbookData; 
        name: string; 
        fileHandle?: FileSystemFileHandle | null; 
        errors?: ValidationError[]; 
        warnings?: ValidationError[];
      } 
    }
  | { type: 'UNLOAD_WORKBOOK' }
  | { 
      type: 'ADD_RECORD'; 
      payload: { 
        entity: 'dailyLogs' | 'expenses' | 'tasks' | 'memories' | 'collections' | 'customModules' | 'moduleFields' | 'moduleEntries'; 
        record: any;
      } 
    }
  | { 
      type: 'UPDATE_RECORD'; 
      payload: { 
        entity: 'dailyLogs' | 'expenses' | 'tasks' | 'memories' | 'collections' | 'customModules' | 'moduleFields' | 'moduleEntries'; 
        id: string; 
        record: any;
      } 
    }
  | { 
      type: 'DELETE_RECORD'; 
      payload: { 
        entity: 'dailyLogs' | 'expenses' | 'tasks' | 'memories' | 'collections' | 'customModules' | 'moduleFields' | 'moduleEntries'; 
        id: string;
      } 
    }
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_SAVED' }
  | { type: 'SET_WORKBOOK_NAME'; payload: string }
  | { type: 'SET_IMPORT_STATUS'; payload: WorkbookState['importStatus'] }
  | { type: 'SET_SAVE_STATUS'; payload: WorkbookState['saveStatus'] }
  | { type: 'SET_FILE_HANDLE'; payload: FileSystemFileHandle | null };

export const initialWorkbookState: WorkbookState = {
  workbookData: null,
  workbookName: null,
  fileHandle: null,
  importStatus: 'idle',
  saveStatus: 'idle',
  importErrors: [],
  importWarnings: [],
  dirty: false,
  lastSavedAt: null
};

export const workbookReducer = (state: WorkbookState, action: WorkbookAction): WorkbookState => {
  switch (action.type) {
    case 'SET_LOADED_WORKBOOK':
      return {
        ...state,
        workbookData: action.payload.data,
        workbookName: action.payload.name,
        fileHandle: action.payload.fileHandle || null,
        importStatus: 'ready',
        importErrors: action.payload.errors || [],
        importWarnings: action.payload.warnings || [],
        dirty: false
      };
      
    case 'UNLOAD_WORKBOOK':
      return {
        ...initialWorkbookState
      };
      
    case 'ADD_RECORD': {
      if (!state.workbookData) return state;
      const { entity, record } = action.payload;
      return {
        ...state,
        workbookData: {
          ...state.workbookData,
          [entity]: [...state.workbookData[entity], record]
        },
        dirty: true
      };
    }
    
    case 'UPDATE_RECORD': {
      if (!state.workbookData) return state;
      const { entity, id, record } = action.payload;
      const updatedList = (state.workbookData[entity] as any[]).map((item) =>
        item.id === id ? { ...item, ...record } : item
      );
      return {
        ...state,
        workbookData: {
          ...state.workbookData,
          [entity]: updatedList
        },
        dirty: true
      };
    }
    
    case 'DELETE_RECORD': {
      if (!state.workbookData) return state;
      const { entity, id } = action.payload;
      const filteredList = (state.workbookData[entity] as any[]).filter((item) => item.id !== id);
      return {
        ...state,
        workbookData: {
          ...state.workbookData,
          [entity]: filteredList
        },
        dirty: true
      };
    }
    
    case 'MARK_DIRTY':
      return {
        ...state,
        dirty: true
      };
      
    case 'MARK_SAVED':
      return {
        ...state,
        dirty: false,
        lastSavedAt: new Date().toISOString(),
        saveStatus: 'saved'
      };

    case 'SET_WORKBOOK_NAME':
      return {
        ...state,
        workbookName: action.payload
      };
      
    case 'SET_IMPORT_STATUS':
      return {
        ...state,
        importStatus: action.payload
      };
      
    case 'SET_SAVE_STATUS':
      return {
        ...state,
        saveStatus: action.payload
      };
      
    case 'SET_FILE_HANDLE':
      return {
        ...state,
        fileHandle: action.payload
      };
      
    default:
      return state;
  }
};
