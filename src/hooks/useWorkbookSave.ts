import { useCallback, useMemo, useState } from 'react';
import { useWorkbook } from './useWorkbook';
import {
  describeSaveResult,
  downloadWorkbook,
  getSuggestedWorkbookFileName,
  isFileSystemAccessSupported,
  saveAsNewFile,
  saveToExistingFile,
  type SaveResult
} from '../services/storage/workbookFileSaver';
import { savePreviousWorkbookSession } from '../services/storage/fileSessionStorage';

export function useWorkbookSave() {
  const { workbookData, workbookName, fileHandle, dirty, setSaveStatus, markSaved, setFileHandle, setWorkbookName } = useWorkbook();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedFileName = useMemo(() => getSuggestedWorkbookFileName(workbookName), [workbookName]);
  const canSave = Boolean(workbookData) && !isSaving;

  const applySaveResult = useCallback(
    async (result: SaveResult): Promise<SaveResult> => {
      if (result.status === 'saved') {
        if (result.fileHandle) {
          setFileHandle(result.fileHandle);
          await savePreviousWorkbookSession(result.fileHandle, result.fileName);
        }

        setWorkbookName(result.fileName);
        markSaved();
        setSaveStatus('saved');
        setError(null);
        return result;
      }

      if (result.status === 'cancelled') {
        setSaveStatus('idle');
        setError(null);
        return result;
      }

      if (result.status === 'noop') {
        setSaveStatus('saved');
        setError(null);
        return result;
      }

      setSaveStatus('error');
      setError(result.message);
      return result;
    },
    [markSaved, setError, setFileHandle, setSaveStatus, setWorkbookName]
  );

  const saveAs = useCallback(async (): Promise<SaveResult> => {
    if (!workbookData) {
      const result: SaveResult = {
        status: 'error',
        fileName: suggestedFileName,
        destination: 'save-as',
        message: 'No workbook is loaded.'
      };
      await applySaveResult(result);
      return result;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const result = isFileSystemAccessSupported()
        ? await saveAsNewFile(workbookData, suggestedFileName)
        : await downloadWorkbook(workbookData, suggestedFileName);
      return await applySaveResult(result);
    } finally {
      setIsSaving(false);
    }
  }, [applySaveResult, setSaveStatus, suggestedFileName, workbookData]);

  const save = useCallback(async (): Promise<SaveResult> => {
    if (!workbookData) {
      const result: SaveResult = {
        status: 'error',
        fileName: suggestedFileName,
        destination: 'existing-file',
        message: 'No workbook is loaded.'
      };
      await applySaveResult(result);
      return result;
    }

    if (!dirty) {
      const result: SaveResult = {
        status: 'noop',
        fileName: suggestedFileName,
        destination: fileHandle ? 'existing-file' : 'download',
        message: 'No changes to save.'
      };
      await applySaveResult(result);
      return result;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      if (fileHandle) {
        const result = await saveToExistingFile(fileHandle, workbookData);
        return await applySaveResult(result);
      }

      const result = isFileSystemAccessSupported()
        ? await saveAsNewFile(workbookData, suggestedFileName)
        : await downloadWorkbook(workbookData, suggestedFileName);
      return await applySaveResult(result);
    } finally {
      setIsSaving(false);
    }
  }, [applySaveResult, dirty, fileHandle, setSaveStatus, suggestedFileName, workbookData]);

  return {
    save,
    saveAs,
    isSaving,
    error,
    canSave,
    describeSaveResult
  };
}