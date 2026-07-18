import { importWorkbook, exportWorkbook, createStarterWorkbook } from './index';
import type { WorkbookData } from '../../types';
import * as assert from 'assert';

console.log('--- Starting Padhivu Workbook Layer Verification ---');

// 1. Create starter workbook
console.log('Generating starter workbook...');
const starterBuffer = createStarterWorkbook();
assert.ok(starterBuffer, 'Starter workbook buffer should be generated');

// 2. Parse starter workbook
console.log('Parsing starter workbook...');
const parseResult = importWorkbook(starterBuffer);

// Check if any errors occurred
if (parseResult.errors.length > 0) {
  console.error('Errors found in starter workbook:', parseResult.errors);
  process.exit(1);
}

const data = parseResult.data;
console.log('Verifying starter schema values...');
assert.strictEqual(data.dailyLogs.length, 0, 'Should have 0 daily logs');
assert.strictEqual(data.expenses.length, 0, 'Should have 0 expenses');
assert.strictEqual(data.settings.theme, 'light', 'Default theme should be light');
assert.strictEqual(data.settings.accent, 'emerald', 'Default accent should be emerald');
assert.strictEqual(data.metadata.workbookVersion, '1.0', 'Workbook version should be 1.0');
assert.strictEqual(data.metadata.schemaVersion, '1', 'Schema version should be 1');

// 3. Inject custom module data
console.log('Injecting CustomModule, ModuleField, and ModuleEntry...');
const testModule = {
  id: 'mod_reading',
  name: 'Reading Tracker',
  icon: 'Book',
  color: 'emerald',
  displayOrder: 1
};

const testField = {
  id: 'field_pages',
  moduleId: 'mod_reading',
  fieldName: 'Pages Read',
  fieldType: 'Number' as const,
  required: true,
  options: [] as string[],
  displayOrder: 1
};

const testEntry = {
  id: 'entry_day1',
  moduleId: 'mod_reading',
  date: '2026-07-18',
  data: {
    'field_pages': 52
  }
};

const modifiedData: WorkbookData = {
  ...data,
  customModules: [testModule],
  moduleFields: [testField],
  moduleEntries: [testEntry]
};

// Validate modified data in memory first
console.log('Validating modified workbook data in memory...');
const memoryValidation = importWorkbook(exportWorkbook(modifiedData));
if (memoryValidation.errors.length > 0) {
  console.error('Validation errors found in memory write:', memoryValidation.errors);
  process.exit(1);
}

// 4. Export the modified workbook data to binary
console.log('Exporting modified workbook data to binary XLSX...');
const exportedBuffer = exportWorkbook(modifiedData);
assert.ok(exportedBuffer, 'Exported workbook buffer should be generated');

// 5. Parse exported workbook data back
console.log('Parsing exported workbook back...');
const roundTripResult = importWorkbook(exportedBuffer);

// Check if any errors occurred on round trip
if (roundTripResult.errors.length > 0) {
  console.error('Errors found in round-tripped workbook:', roundTripResult.errors);
  process.exit(1);
}

const roundTripData = roundTripResult.data;

// 6. Assert assertions
console.log('Asserting round-trip data values...');

// Custom Modules assertions
assert.strictEqual(roundTripData.customModules.length, 1, 'Should have 1 custom module');
assert.strictEqual(roundTripData.customModules[0].id, 'mod_reading', 'Module ID mismatch');
assert.strictEqual(roundTripData.customModules[0].name, 'Reading Tracker', 'Module Name mismatch');

// Module Fields assertions
assert.strictEqual(roundTripData.moduleFields.length, 1, 'Should have 1 module field');
assert.strictEqual(roundTripData.moduleFields[0].id, 'field_pages', 'Field ID mismatch');
assert.strictEqual(roundTripData.moduleFields[0].fieldName, 'Pages Read', 'Field Name mismatch');
assert.strictEqual(roundTripData.moduleFields[0].fieldType, 'Number', 'Field Type mismatch');
assert.deepStrictEqual(roundTripData.moduleFields[0].options, [], 'Field options should be empty array');

// Module Entries assertions
assert.strictEqual(roundTripData.moduleEntries.length, 1, 'Should have 1 module entry');
assert.strictEqual(roundTripData.moduleEntries[0].id, 'entry_day1', 'Entry ID mismatch');
assert.strictEqual(roundTripData.moduleEntries[0].date, '2026-07-18', 'Entry Date mismatch');
assert.deepStrictEqual(
  roundTripData.moduleEntries[0].data,
  { 'field_pages': 52 },
  'Entry data values mismatch'
);

// Metadata update assertions
assert.ok(roundTripData.metadata.updatedAt, 'updatedAt metadata should exist');
assert.strictEqual(roundTripData.metadata.schemaVersion, '1', 'schemaVersion should be 1');

console.log('✓ round-trip verification successful! All assertions passed.');
