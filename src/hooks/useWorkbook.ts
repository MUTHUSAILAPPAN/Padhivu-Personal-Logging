import { useContext } from 'react';
import { WorkbookContext } from '../context/WorkbookContext';
import type { WorkbookState } from '../context/workbookReducer';
import type { WorkbookData } from '../types';
import type { ValidationError } from '../services/workbook';

export function useWorkbook() {
  const context = useContext(WorkbookContext);
  if (!context) {
    throw new Error('useWorkbook must be used within a WorkbookProvider');
  }

  const { state, dispatch } = context;

  const setLoadedWorkbook = (
    data: WorkbookData,
    name: string,
    fileHandle?: FileSystemFileHandle | null,
    errors?: ValidationError[],
    warnings?: ValidationError[]
  ) => {
    dispatch({
      type: 'SET_LOADED_WORKBOOK',
      payload: { data, name, fileHandle, errors, warnings }
    });
  };

  const unloadWorkbook = () => {
    dispatch({ type: 'UNLOAD_WORKBOOK' });
  };

  const addRecord = (
    entity: 'dailyLogs' | 'expenses' | 'tasks' | 'memories' | 'collections' | 'customModules' | 'moduleFields' | 'moduleEntries',
    record: any
  ) => {
    dispatch({ type: 'ADD_RECORD', payload: { entity, record } });
  };

  const updateRecord = (
    entity: 'dailyLogs' | 'expenses' | 'tasks' | 'memories' | 'collections' | 'customModules' | 'moduleFields' | 'moduleEntries',
    id: string,
    record: any
  ) => {
    dispatch({ type: 'UPDATE_RECORD', payload: { entity, id, record } });
  };

  const deleteRecord = (
    entity: 'dailyLogs' | 'expenses' | 'tasks' | 'memories' | 'collections' | 'customModules' | 'moduleFields' | 'moduleEntries',
    id: string
  ) => {
    dispatch({ type: 'DELETE_RECORD', payload: { entity, id } });
  };

  const markDirty = () => {
    dispatch({ type: 'MARK_DIRTY' });
  };

  const updateSettings = (settings: Record<string, string>) => {
    if (!state.workbookData) {
      return;
    }

    const nextWorkbookData = {
      ...state.workbookData,
      settings: {
        ...(state.workbookData.settings || {}),
        ...settings
      }
    };

    setLoadedWorkbook(nextWorkbookData, state.workbookName || 'Local Workbook', state.fileHandle, state.importErrors, state.importWarnings);
    markDirty();
  };

  const markSaved = () => {
    dispatch({ type: 'MARK_SAVED' });
  };

  const setWorkbookName = (name: string) => {
    dispatch({ type: 'SET_WORKBOOK_NAME', payload: name });
  };

  const setImportStatus = (status: WorkbookState['importStatus']) => {
    dispatch({ type: 'SET_IMPORT_STATUS', payload: status });
  };

  const setSaveStatus = (status: WorkbookState['saveStatus']) => {
    dispatch({ type: 'SET_SAVE_STATUS', payload: status });
  };

  const setFileHandle = (handle: FileSystemFileHandle | null) => {
    dispatch({ type: 'SET_FILE_HANDLE', payload: handle });
  };

  return {
    workbookData: state.workbookData,
    workbookName: state.workbookName,
    fileHandle: state.fileHandle,
    importStatus: state.importStatus,
    saveStatus: state.saveStatus,
    importErrors: state.importErrors,
    importWarnings: state.importWarnings,
    dirty: state.dirty,
    lastSavedAt: state.lastSavedAt,
    
    // Actions
    setLoadedWorkbook,
    unloadWorkbook,
    addRecord,
    updateRecord,
    deleteRecord,
    updateSettings,
    markDirty,
    markSaved,
    setWorkbookName,
    setImportStatus,
    setSaveStatus,
    setFileHandle
  };
}
