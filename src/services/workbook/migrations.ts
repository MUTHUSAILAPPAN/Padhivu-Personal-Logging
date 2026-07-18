import type { WorkbookData } from '../../types';

export type MigrationFn = (data: WorkbookData) => WorkbookData;

// Migration registry keyed by target schema version.
// Keys are the versions that the migration upgrades the data TO.
export const MIGRATION_REGISTRY: Record<number, MigrationFn> = {
  1: (data) => data, // Version 1 is the baseline and is a no-op
};

/**
 * Runs migrations on the parsed WorkbookData from the workbook's current schema version
 * up to the application's current canonical schema version.
 */
export const migrateWorkbookData = (
  data: WorkbookData,
  sourceVersion: number,
  targetVersion: number = 1
): WorkbookData => {
  let migratedData = { ...data };
  
  if (sourceVersion > targetVersion) {
    throw new Error(`Cannot downgrade workbook schema from version ${sourceVersion} to ${targetVersion}`);
  }
  
  for (let v = sourceVersion + 1; v <= targetVersion; v++) {
    const migrate = MIGRATION_REGISTRY[v];
    if (migrate) {
      migratedData = migrate(migratedData);
    }
  }
  
  // Ensure metadata version is updated to the target version
  migratedData.metadata = {
    ...migratedData.metadata,
    schemaVersion: targetVersion.toString()
  };
  
  return migratedData;
};
