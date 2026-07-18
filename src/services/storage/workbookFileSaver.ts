import type { WorkbookData } from '../../types';
import { exportWorkbook } from '../workbook';

export type SaveResult =
  | {
      status: 'saved';
      fileName: string;
      message: string;
      fileHandle?: FileSystemFileHandle | null;
      destination: 'existing-file' | 'save-as' | 'download';
    }
  | {
      status: 'cancelled';
      fileName: string;
      message: string;
      destination: 'existing-file' | 'save-as';
    }
  | {
      status: 'error';
      fileName: string;
      message: string;
      destination: 'existing-file' | 'save-as' | 'download';
    }
  | {
      status: 'noop';
      fileName: string;
      message: string;
      destination: 'existing-file' | 'save-as' | 'download';
    };

type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept?: Record<string, string[]>;
  }>;
  excludeAcceptAllOption?: boolean;
};

const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const isFileSystemAccessSupported = (): boolean => {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
};

export const getSuggestedWorkbookFileName = (workbookName?: string | null): string => {
  const trimmedName = workbookName?.trim();
  if (!trimmedName) {
    return 'padhivu-workbook.xlsx';
  }

  if (/\.xlsx$/i.test(trimmedName)) {
    return trimmedName;
  }

  const strippedName = trimmedName.replace(/\.(xls|xlsm|xlsb)$/i, '');
  return `${strippedName}.xlsx`;
};

export const describeSaveResult = (result: SaveResult): string => {
  switch (result.status) {
    case 'saved':
      return result.destination === 'download'
        ? `Workbook downloaded as ${result.fileName}.`
        : `Workbook saved as ${result.fileName}.`;
    case 'cancelled':
      return 'Save cancelled.';
    case 'noop':
      return 'No changes to save.';
    case 'error':
      return result.message;
  }
};

const getWindowPicker = (): ((options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>) | null => {
  if (!isFileSystemAccessSupported()) {
    return null;
  }

  return (window as Window & { showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle> }).showSaveFilePicker ?? null;
};

const toArrayBuffer = (workbookData: WorkbookData): ArrayBuffer => {
  return exportWorkbook(workbookData);
};

const createErrorResult = (fileName: string, destination: SaveResult['destination'], message: string): SaveResult => ({
  status: 'error',
  fileName,
  destination,
  message
});

const createCancelledResult = (fileName: string, destination: 'existing-file' | 'save-as'): SaveResult => ({
  status: 'cancelled',
  fileName,
  destination,
  message: 'Save cancelled.'
});

const createNoopResult = (fileName: string): SaveResult => ({
  status: 'noop',
  fileName,
  destination: 'existing-file',
  message: 'No changes to save.'
});

export const saveToExistingFile = async (
  fileHandle: FileSystemFileHandle,
  workbookData: WorkbookData
): Promise<SaveResult> => {
  const fileName = getSuggestedWorkbookFileName(fileHandle.name);
  const permissionHandle = fileHandle as FileSystemFileHandle & {
    queryPermission?: (descriptor: { mode: 'readwrite' }) => Promise<PermissionState>;
    requestPermission?: (descriptor: { mode: 'readwrite' }) => Promise<PermissionState>;
    createWritable?: () => Promise<FileSystemWritableFileStream>;
  };

  try {
    const currentPermission = await permissionHandle.queryPermission?.({ mode: 'readwrite' });
    const granted =
      currentPermission === 'granted' ||
      (await permissionHandle.requestPermission?.({ mode: 'readwrite' })) === 'granted';

    if (!granted) {
      return createErrorResult(fileName, 'existing-file', 'Permission to save the workbook was denied.');
    }

    if (!permissionHandle.createWritable) {
      return createErrorResult(fileName, 'existing-file', 'Saving is not supported for this file handle.');
    }

    const buffer = toArrayBuffer(workbookData);
    const writable = await permissionHandle.createWritable();

    try {
      await writable.write(buffer);
    } finally {
      try {
        await writable.close();
      } catch {
        // Closing should not hide the original write error.
      }
    }

    return {
      status: 'saved',
      fileName,
      fileHandle,
      destination: 'existing-file',
      message: 'Workbook saved.'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save the workbook.';
    return createErrorResult(fileName, 'existing-file', message);
  }
};

export const saveAsNewFile = async (
  workbookData: WorkbookData,
  suggestedFileName: string
): Promise<SaveResult> => {
  const picker = getWindowPicker();
  if (!picker) {
    return createErrorResult(suggestedFileName, 'save-as', 'File System Access is not supported in this browser.');
  }

  try {
    const fileHandle = await picker({
      suggestedName: suggestedFileName,
      excludeAcceptAllOption: true,
      types: [
        {
          description: 'Excel workbook',
          accept: {
            [EXCEL_MIME_TYPE]: ['.xlsx']
          }
        }
      ]
    });

    const buffer = toArrayBuffer(workbookData);
    const permissionHandle = fileHandle as FileSystemFileHandle & {
      requestPermission?: (descriptor: { mode: 'readwrite' }) => Promise<PermissionState>;
      createWritable?: () => Promise<FileSystemWritableFileStream>;
    };

    if (permissionHandle.requestPermission) {
      const granted = (await permissionHandle.requestPermission({ mode: 'readwrite' })) === 'granted';
      if (!granted) {
        return createErrorResult(fileHandle.name, 'save-as', 'Permission to save the workbook was denied.');
      }
    }

    if (!permissionHandle.createWritable) {
      return createErrorResult(fileHandle.name, 'save-as', 'Saving is not supported for the chosen file handle.');
    }

    const writable = await permissionHandle.createWritable();
    try {
      await writable.write(buffer);
    } finally {
      try {
        await writable.close();
      } catch {
        // Ignore close failures after a successful write.
      }
    }

    return {
      status: 'saved',
      fileName: fileHandle.name,
      fileHandle,
      destination: 'save-as',
      message: 'Workbook saved.'
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return createCancelledResult(suggestedFileName, 'save-as');
    }

    const message = error instanceof Error ? error.message : 'Failed to save the workbook.';
    return createErrorResult(suggestedFileName, 'save-as', message);
  }
};

export const downloadWorkbook = async (
  workbookData: WorkbookData,
  fileName: string
): Promise<SaveResult> => {
  try {
    const buffer = toArrayBuffer(workbookData);
    const blob = new Blob([buffer], { type: EXCEL_MIME_TYPE });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    return {
      status: 'saved',
      fileName,
      destination: 'download',
      message: 'Workbook downloaded.'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to download the workbook.';
    return createErrorResult(fileName, 'download', message);
  }
};

export const mapSaveResult = (result: SaveResult): 'saved' | 'cancelled' | 'error' | 'noop' => result.status;

export const createNoChangesResult = (fileName: string): SaveResult => createNoopResult(fileName);