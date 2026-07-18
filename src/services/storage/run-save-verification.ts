import {
  createNoChangesResult,
  describeSaveResult,
  getSuggestedWorkbookFileName,
  mapSaveResult,
  type SaveResult
} from './workbookFileSaver';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const manualSaveChecklist = [
  'Import workbook, make a small in-memory edit, then use Save.',
  'Import workbook, use Save As, choose a new file, and verify the new file opens in Excel.',
  'In a browser without File System Access API, confirm export download still works.',
  'Cancel Save As and confirm dirty state remains true.'
] as const;

export function runSaveVerification(): void {
  assert(getSuggestedWorkbookFileName(null) === 'padhivu-workbook.xlsx', 'Default suggested file name should be used when no workbook is loaded.');
  assert(getSuggestedWorkbookFileName('Journal') === 'Journal.xlsx', 'Workbook names should gain an .xlsx extension when needed.');
  assert(getSuggestedWorkbookFileName('Archive.xlsx') === 'Archive.xlsx', 'Existing .xlsx names should be preserved.');

  const noChanges = createNoChangesResult('Archive.xlsx');
  assert(mapSaveResult(noChanges) === 'noop', 'No-change saves should map to noop.');
  assert(describeSaveResult(noChanges) === 'No changes to save.', 'No-change feedback should be user-friendly.');

  const cancelled: SaveResult = {
    status: 'cancelled',
    fileName: 'Archive.xlsx',
    destination: 'save-as',
    message: 'Save cancelled.'
  };
  assert(mapSaveResult(cancelled) === 'cancelled', 'Cancelled saves should map to cancelled.');
  assert(describeSaveResult(cancelled) === 'Save cancelled.', 'Cancelled feedback should be stable.');

  const saved: SaveResult = {
    status: 'saved',
    fileName: 'Archive.xlsx',
    destination: 'download',
    message: 'Workbook downloaded.'
  };
  assert(mapSaveResult(saved) === 'saved', 'Saved results should map to saved.');
  assert(describeSaveResult(saved) === 'Workbook downloaded as Archive.xlsx.', 'Download feedback should describe the destination.');
}

runSaveVerification();