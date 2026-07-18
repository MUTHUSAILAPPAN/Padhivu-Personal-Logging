export interface PreviousWorkbookSession {
  key: 'previous-workbook';
  fileHandle: FileSystemFileHandle;
  fileName: string;
  lastOpenedAt: string;
}

const DB_NAME = 'padhivu-file-session';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';
const SESSION_KEY: PreviousWorkbookSession['key'] = 'previous-workbook';

type MaybeSession = PreviousWorkbookSession | null;

const isIndexedDbAvailable = (): boolean => typeof indexedDB !== 'undefined' && typeof window !== 'undefined';

const isFileSystemAccessAvailable = (): boolean => typeof window !== 'undefined' && 'showOpenFilePicker' in window;

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error('IndexedDB is not available.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
    request.onblocked = () => reject(new Error('IndexedDB is blocked by another tab or dialog.'));
  });
};

const waitForTransaction = (transaction: IDBTransaction): Promise<void> => {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed.'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted.'));
  });
};

export const isPreviousWorkbookSessionSupported = (): boolean => {
  return isIndexedDbAvailable() && isFileSystemAccessAvailable();
};

export const savePreviousWorkbookSession = async (
  fileHandle: FileSystemFileHandle,
  fileName: string,
  lastOpenedAt: string = new Date().toISOString()
): Promise<boolean> => {
  if (!isPreviousWorkbookSessionSupported()) {
    return false;
  }

  try {
    const db = await openDatabase();
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put({
        key: SESSION_KEY,
        fileHandle,
        fileName,
        lastOpenedAt
      } satisfies PreviousWorkbookSession);
      await waitForTransaction(transaction);
      return true;
    } finally {
      db.close();
    }
  } catch {
    return false;
  }
};

export const getPreviousWorkbookSession = async (): Promise<MaybeSession> => {
  if (!isPreviousWorkbookSessionSupported()) {
    return null;
  }

  try {
    const db = await openDatabase();
    try {
      return await new Promise<MaybeSession>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(SESSION_KEY);
        request.onsuccess = () => resolve((request.result as MaybeSession) || null);
        request.onerror = () => reject(request.error || new Error('Failed to read previous workbook session.'));
      });
    } finally {
      db.close();
    }
  } catch {
    return null;
  }
};

export const clearPreviousWorkbookSession = async (): Promise<boolean> => {
  if (!isIndexedDbAvailable()) {
    return false;
  }

  try {
    const db = await openDatabase();
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(SESSION_KEY);
      await waitForTransaction(transaction);
      return true;
    } finally {
      db.close();
    }
  } catch {
    return false;
  }
};