import {
  clearPreviousWorkbookSession,
  getPreviousWorkbookSession,
  isPreviousWorkbookSessionSupported,
  savePreviousWorkbookSession,
  type PreviousWorkbookSession
} from './fileSessionStorage';

async function main() {
  const supported = isPreviousWorkbookSessionSupported();
  if (typeof supported !== 'boolean') {
    throw new Error('Support detection must return a boolean.');
  }

  if (!supported) {
    if ((await getPreviousWorkbookSession()) !== null) {
      throw new Error('Unsupported browsers should not return a session.');
    }
    if ((await clearPreviousWorkbookSession()) !== false) {
      throw new Error('Clearing should fail gracefully when storage is unavailable.');
    }
    console.log('Previous-workbook session fallback verified for unsupported browsers.');
    return;
  }

  const fakeHandle = {
    kind: 'file',
    name: 'padhivu.xlsx',
    queryPermission: async () => 'granted',
    requestPermission: async () => 'granted'
  } as unknown as FileSystemFileHandle;

  const saved = await savePreviousWorkbookSession(fakeHandle, 'padhivu.xlsx', '2026-07-18T00:00:00.000Z');
  if (!saved) {
    throw new Error('Session should be saved when the browser supports the feature.');
  }

  const session = await getPreviousWorkbookSession();
  if (!session) {
    throw new Error('Saved session should round-trip from IndexedDB.');
  }
  if ((session as PreviousWorkbookSession).key !== 'previous-workbook') {
    throw new Error('Session key should remain stable.');
  }
  if (session.fileName !== 'padhivu.xlsx' || session.lastOpenedAt !== '2026-07-18T00:00:00.000Z') {
    throw new Error('Session fields should survive serialization and deserialization.');
  }

  const cleared = await clearPreviousWorkbookSession();
  if (!cleared) {
    throw new Error('Session should clear successfully.');
  }
  if ((await getPreviousWorkbookSession()) !== null) {
    throw new Error('Cleared session should not remain in storage.');
  }

  console.log('Previous-workbook session persistence verified.');
}

main().catch((error) => {
  console.error(error);
  throw error;
});