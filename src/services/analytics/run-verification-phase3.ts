/**
 * Phase 3 Verification Script
 * Tests: reducer immutability, analytics on empty/populated data, search indexing
 */
import * as assert from 'assert';
import { workbookReducer, initialWorkbookState } from '../../context/workbookReducer';
import { getExpenseAnalytics, formatCurrency } from './expenseAnalytics';
import { getTaskAnalytics } from './taskAnalytics';
import { getMemoryAnalytics } from './memoryAnalytics';
import { getModuleAnalytics } from './moduleAnalytics';
import { getGreeting, getTodayLabel, getRecentActivity } from './dashboardAnalytics';
import { SearchIndex } from '../search/searchIndex';
import type { WorkbookData, Expense, Task, Memory, CustomModule, ModuleField, ModuleEntry } from '../../types';

function createEmptyWorkbookData(): WorkbookData {
  return {
    dailyLogs: [],
    expenses: [],
    tasks: [],
    memories: [],
    collections: [],
    customModules: [],
    moduleFields: [],
    moduleEntries: [],
    settings: {},
    metadata: {},
    unknownSheets: {}
  };
}

console.log('=== Phase 3 Verification ===\n');

// ── 1. Reducer Immutability Tests ──
console.log('1. Testing reducer immutability...');

const emptyData = createEmptyWorkbookData();

// SET_LOADED_WORKBOOK
const loadedState = workbookReducer(initialWorkbookState, {
  type: 'SET_LOADED_WORKBOOK',
  payload: { data: emptyData, name: 'test.xlsx' }
});
assert.ok(loadedState !== initialWorkbookState, 'SET_LOADED_WORKBOOK should return new state');
assert.strictEqual(loadedState.workbookName, 'test.xlsx');
assert.strictEqual(loadedState.importStatus, 'ready');
assert.strictEqual(loadedState.dirty, false);

// ADD_RECORD
const expense: Expense = {
  id: 'exp-1', date: '2026-07-18', time: '10:00', category: 'Food',
  description: 'Lunch', paymentMethod: 'Card', amount: 15.50, currency: 'USD', tags: '', notes: ''
};
const afterAdd = workbookReducer(loadedState, {
  type: 'ADD_RECORD',
  payload: { entity: 'expenses', record: expense }
});
assert.ok(afterAdd !== loadedState, 'ADD_RECORD should return new state');
assert.strictEqual(afterAdd.workbookData!.expenses.length, 1);
assert.strictEqual(loadedState.workbookData!.expenses.length, 0, 'Original state must remain unchanged');
assert.strictEqual(afterAdd.dirty, true);

// UPDATE_RECORD
const afterUpdate = workbookReducer(afterAdd, {
  type: 'UPDATE_RECORD',
  payload: { entity: 'expenses', id: 'exp-1', record: { amount: 20 } }
});
assert.ok(afterUpdate !== afterAdd, 'UPDATE_RECORD should return new state');
assert.strictEqual(afterUpdate.workbookData!.expenses[0].amount, 20);
assert.strictEqual(afterAdd.workbookData!.expenses[0].amount, 15.50, 'Previous state untouched');

// DELETE_RECORD
const afterDelete = workbookReducer(afterUpdate, {
  type: 'DELETE_RECORD',
  payload: { entity: 'expenses', id: 'exp-1' }
});
assert.strictEqual(afterDelete.workbookData!.expenses.length, 0);
assert.strictEqual(afterUpdate.workbookData!.expenses.length, 1, 'Previous state untouched');

// MARK_SAVED
const afterSaved = workbookReducer(afterAdd, { type: 'MARK_SAVED' });
assert.strictEqual(afterSaved.dirty, false);
assert.ok(afterSaved.lastSavedAt !== null);

// UNLOAD
const afterUnload = workbookReducer(afterAdd, { type: 'UNLOAD_WORKBOOK' });
assert.strictEqual(afterUnload.workbookData, null);
assert.strictEqual(afterUnload.workbookName, null);

console.log('   ✓ All reducer immutability tests passed.\n');

// ── 2. Empty WorkbookData Analytics ──
console.log('2. Testing analytics with empty data...');

const emptyExpenseResult = getExpenseAnalytics([]);
assert.strictEqual(emptyExpenseResult.todayTotal, 0);
assert.strictEqual(emptyExpenseResult.lifetimeTotal, 0);
assert.strictEqual(Object.keys(emptyExpenseResult.byCategory).length, 0);

const emptyTaskResult = getTaskAnalytics([]);
assert.strictEqual(emptyTaskResult.totalCount, 0);
assert.strictEqual(emptyTaskResult.completionRate, 0);

const emptyMemoryResult = getMemoryAnalytics([]);
assert.strictEqual(emptyMemoryResult.totalCount, 0);
assert.strictEqual(emptyMemoryResult.favoriteCount, 0);

const emptyModuleResult = getModuleAnalytics([], []);
assert.strictEqual(emptyModuleResult.mostActiveModule, null);

console.log('   ✓ Empty data analytics tests passed.\n');

// ── 3. Expense Category Aggregation ──
console.log('3. Testing expense category aggregation...');

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const testExpenses: Expense[] = [
  { id: '1', date: today, time: '08:00', category: 'Food', description: 'Breakfast', paymentMethod: 'Cash', amount: 5, currency: 'USD', tags: '', notes: '' },
  { id: '2', date: today, time: '12:00', category: 'Food', description: 'Lunch', paymentMethod: 'Card', amount: 12, currency: 'USD', tags: '', notes: '' },
  { id: '3', date: today, time: '14:00', category: 'Transport', description: 'Uber', paymentMethod: 'Card', amount: 20, currency: 'USD', tags: '', notes: '' },
  { id: '4', date: '2025-01-01', time: '10:00', category: 'Shopping', description: 'Shirt', paymentMethod: 'Card', amount: 50, currency: 'USD', tags: '', notes: '' },
];

const expResult = getExpenseAnalytics(testExpenses);
assert.strictEqual(expResult.byCategory['Food'], 17);
assert.strictEqual(expResult.byCategory['Transport'], 20);
assert.strictEqual(expResult.byCategory['Shopping'], 50);
assert.strictEqual(expResult.todayTotal, 37); // 5+12+20
assert.strictEqual(expResult.lifetimeTotal, 87);

const formatted = formatCurrency(100.5, 'USD', 'en-US');
assert.ok(formatted.includes('100.50') || formatted.includes('100,50'), `Currency format: ${formatted}`);

console.log('   ✓ Expense aggregation tests passed.\n');

// ── 4. Task Completion & Overdue ──
console.log('4. Testing task completion and overdue logic...');

const testTasks: Task[] = [
  { id: 't1', title: 'Done task', description: '', status: 'completed', priority: 'low', dueDate: '2026-07-01', completedDate: '2026-07-01', reminder: '', tags: '' },
  { id: 't2', title: 'Overdue task', description: '', status: 'todo', priority: 'high', dueDate: '2025-01-01', completedDate: '', reminder: '', tags: '' },
  { id: 't3', title: 'Future task', description: '', status: 'in_progress', priority: 'medium', dueDate: '2030-12-31', completedDate: '', reminder: '', tags: '' },
  { id: 't4', title: 'No date task', description: '', status: 'todo', priority: 'low', dueDate: '', completedDate: '', reminder: '', tags: '' },
];

const taskResult = getTaskAnalytics(testTasks);
assert.strictEqual(taskResult.totalCount, 4);
assert.strictEqual(taskResult.completedCount, 1);
assert.strictEqual(taskResult.completionRate, 25);
assert.strictEqual(taskResult.overdueTasks.length, 1);
assert.strictEqual(taskResult.overdueTasks[0].id, 't2');
assert.strictEqual(taskResult.highPriorityOpenTasks.length, 1);
assert.strictEqual(taskResult.highPriorityOpenTasks[0].id, 't2');
assert.ok(taskResult.upcomingTasks.length >= 1); // Future task

console.log('   ✓ Task analytics tests passed.\n');

// ── 5. Memory Analytics ──
console.log('5. Testing memory analytics...');

const testMemories: Memory[] = [
  { id: 'm1', date: '2026-07-18', title: 'Beach day', category: 'Travel', description: 'Fun day out', location: 'Beach', mood: 'happy', favorite: true, tags: '' },
  { id: 'm2', date: '2026-07-17', title: 'Coffee chat', category: 'Social', description: 'Met friend', location: 'Cafe', mood: 'content', favorite: false, tags: '' },
  { id: 'm3', date: '2026-07-16', title: 'Hike', category: 'Travel', description: 'Mountain trail', location: 'Hills', mood: 'energized', favorite: true, tags: '' },
];

const memResult = getMemoryAnalytics(testMemories);
assert.strictEqual(memResult.totalCount, 3);
assert.strictEqual(memResult.favoriteCount, 2);
assert.strictEqual(memResult.byCategory['Travel'], 2);
assert.strictEqual(memResult.byCategory['Social'], 1);
assert.strictEqual(memResult.recentMemories[0].id, 'm1'); // Most recent first

console.log('   ✓ Memory analytics tests passed.\n');

// ── 6. Dashboard Analytics ──
console.log('6. Testing dashboard analytics...');

const greeting = getGreeting();
assert.ok(
  greeting === 'Good morning' || greeting === 'Good afternoon' || greeting === 'Good evening',
  `Greeting should be valid: ${greeting}`
);

const todayLabel = getTodayLabel();
assert.ok(todayLabel.length > 5, `Today label should be readable: ${todayLabel}`);

const activity = getRecentActivity(testExpenses, testTasks, testMemories, [], []);
assert.ok(activity.length > 0, 'Should have recent activity items');
assert.ok(activity.length <= 10, 'Should cap at 10 items');

console.log('   ✓ Dashboard analytics tests passed.\n');

// ── 7. Search Indexing ──
console.log('7. Testing search indexing...');

const testModules: CustomModule[] = [
  { id: 'mod1', name: 'Workout Log', icon: 'Dumbbell', color: 'blue', displayOrder: 1 }
];
const testFields: ModuleField[] = [
  { id: 'f1', moduleId: 'mod1', fieldName: 'Reps', fieldType: 'Number', required: true, options: [], displayOrder: 1 },
  { id: 'f2', moduleId: 'mod1', fieldName: 'Exercise', fieldType: 'Text', required: true, options: [], displayOrder: 2 }
];
const testEntries: ModuleEntry[] = [
  { id: 'e1', moduleId: 'mod1', date: '2026-07-18', data: { f1: 12, f2: 'Push-ups' } }
];

const searchData: WorkbookData = {
  ...createEmptyWorkbookData(),
  tasks: testTasks,
  expenses: testExpenses,
  memories: testMemories,
  customModules: testModules,
  moduleFields: testFields,
  moduleEntries: testEntries
};

const idx = new SearchIndex();
idx.build(searchData);

// Search for a task
const taskResults = idx.search('Overdue');
assert.ok(taskResults.length > 0, 'Should find overdue task');
assert.strictEqual(taskResults[0].entityType, 'Task');

// Search for an expense category
const expResults = idx.search('Food');
assert.ok(expResults.length > 0, 'Should find food expenses');

// Search for a memory
const memResults = idx.search('Beach');
assert.ok(memResults.length > 0, 'Should find beach memory');

// Search for custom module entry content
const modResults = idx.search('Push-ups');
assert.ok(modResults.length > 0, 'Should find module entry with Push-ups');
assert.strictEqual(modResults[0].entityType, 'ModuleEntry');

// Search for custom module name
const modNameResults = idx.search('Workout');
assert.ok(modNameResults.length > 0, 'Should find Workout Log module');

// Empty query returns empty
const emptyResults = idx.search('');
assert.strictEqual(emptyResults.length, 0, 'Empty query should return no results');

console.log('   ✓ Search indexing tests passed.\n');

console.log('=== All Phase 3 Verification Tests Passed! ===');
