import type { Memory } from '../../types';

export interface MemorySummary {
  totalCount: number;
  recentMemories: Memory[];
  byCategory: Record<string, number>;
  favoriteCount: number;
}

export const getMemoryAnalytics = (memories: Memory[] = []): MemorySummary => {
  const totalCount = memories.length;
  const byCategory: Record<string, number> = {};
  let favoriteCount = 0;

  memories.forEach((memory) => {
    if (memory.favorite) {
      favoriteCount++;
    }
    const cat = memory.category.trim() || 'General';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  const recentMemories = [...memories]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return {
    totalCount,
    recentMemories,
    byCategory,
    favoriteCount
  };
};
