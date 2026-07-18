import { useCallback, useEffect, useState } from 'react';
import { useWorkbook } from './useWorkbook';
import { importWorkbook } from '../services/workbook';
import {
  clearPreviousWorkbookSession,
  getPreviousWorkbookSession,
  isPreviousWorkbookSessionSupported,
  savePreviousWorkbookSession,
  type PreviousWorkbookSession
} from '../services/storage/fileSessionStorage';

export interface PreviousWorkbookActionResult {
  ok: boolean;
  error?: string;
}

export function usePreviousWorkbook() {
  const { setLoadedWorkbook, setImportStatus, setFileHandle } = useWorkbook();
  const [session, setSession] = useState<PreviousWorkbookSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      setIsLoading(true);
      const savedSession = await getPreviousWorkbookSession();
      if (!active) {
        return;
      }
      setSession(savedSession);
      setIsLoading(false);
    };

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  const continuePreviousWorkbook = useCallback(async (): Promise<PreviousWorkbookActionResult> => {
    if (!session) {
      return { ok: false, error: 'No saved workbook session found.' };
    }

    if (!isPreviousWorkbookSessionSupported()) {
      return {
        ok: false,
        error: 'Your browser does not support reopening local files automatically. You can still import and export workbooks.'
      };
    }

    try {
      const permissionHandle = session.fileHandle as FileSystemFileHandle & {
        queryPermission?: (descriptor: { mode: 'read' }) => Promise<PermissionState>;
        requestPermission?: (descriptor: { mode: 'read' }) => Promise<PermissionState>;
      };

      const permissionState = await permissionHandle.queryPermission?.({ mode: 'read' });
      const granted =
        permissionState === 'granted' ||
        (await permissionHandle.requestPermission?.({ mode: 'read' })) === 'granted';

      if (!granted) {
        return { ok: false, error: 'Access to the previous workbook was denied.' };
      }

      const file = await session.fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      const result = importWorkbook(arrayBuffer);

      if (result.errors.some((item) => item.severity === 'error')) {
        setImportStatus('error');
        return {
          ok: false,
          error: result.errors[0]?.message || 'The workbook could not be opened.'
        };
      }

      setLoadedWorkbook(result.data, session.fileName, session.fileHandle, result.errors, result.warnings);
      setFileHandle(session.fileHandle);
      setImportStatus('ready');
      return { ok: true };
    } catch {
      setImportStatus('error');
      return { ok: false, error: 'Unable to reopen the saved workbook.' };
    }
  }, [session, setFileHandle, setImportStatus, setLoadedWorkbook]);

  const clearPreviousWorkbook = useCallback(async () => {
    await clearPreviousWorkbookSession();
    setSession(null);
  }, []);

  const rememberPreviousWorkbook = useCallback(async (fileHandle: FileSystemFileHandle, fileName: string) => {
    const saved = await savePreviousWorkbookSession(fileHandle, fileName);
    if (saved) {
      setSession({
        key: 'previous-workbook',
        fileHandle,
        fileName,
        lastOpenedAt: new Date().toISOString()
      });
    }
    return saved;
  }, []);

  return {
    isSupported: isPreviousWorkbookSessionSupported(),
    isLoading,
    session,
    continuePreviousWorkbook,
    clearPreviousWorkbook,
    rememberPreviousWorkbook
  };
}