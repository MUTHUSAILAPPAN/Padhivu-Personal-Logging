import type { CustomModule, ModuleEntry } from '../../types';

export interface ModuleSummary {
  entryCountsByModule: Record<string, number>; // moduleId -> count
  mostActiveModule: { id: string; name: string; count: number } | null;
  recentEntries: (ModuleEntry & { moduleName: string })[];
}

export const getModuleAnalytics = (
  customModules: CustomModule[] = [],
  moduleEntries: ModuleEntry[] = []
): ModuleSummary => {
  const entryCountsByModule: Record<string, number> = {};
  
  // Initialize count
  customModules.forEach((m) => {
    entryCountsByModule[m.id] = 0;
  });

  moduleEntries.forEach((entry) => {
    entryCountsByModule[entry.moduleId] = (entryCountsByModule[entry.moduleId] || 0) + 1;
  });

  // Find most active module
  let mostActiveId = '';
  let maxCount = -1;

  Object.entries(entryCountsByModule).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostActiveId = id;
    }
  });

  const activeModuleDef = customModules.find((m) => m.id === mostActiveId);
  const mostActiveModule = activeModuleDef
    ? { id: activeModuleDef.id, name: activeModuleDef.name, count: maxCount }
    : null;

  // Recent entries with module name
  const modulesMap = new Map(customModules.map((m) => [m.id, m.name]));
  const recentEntries = [...moduleEntries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((entry) => ({
      ...entry,
      moduleName: modulesMap.get(entry.moduleId) || 'Custom Module'
    }));

  return {
    entryCountsByModule,
    mostActiveModule,
    recentEntries
  };
};
