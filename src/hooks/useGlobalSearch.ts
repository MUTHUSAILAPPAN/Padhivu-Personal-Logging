import { useState, useEffect, useRef } from 'react';
import { useWorkbook } from './useWorkbook';
import { useDebounce } from './useDebounce';
import { SearchIndex } from '../services/search/searchIndex';
import type { SearchResult } from '../services/search/searchTypes';

export function useGlobalSearch() {
  const { workbookData } = useWorkbook();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200); // 200ms debounce
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchIndexRef = useRef<SearchIndex | null>(null);

  // Initialize and rebuild index when data changes
  useEffect(() => {
    if (!searchIndexRef.current) {
      searchIndexRef.current = new SearchIndex();
    }
    
    if (workbookData) {
      searchIndexRef.current.build(workbookData);
      
      // Re-trigger active search if query exists
      if (query.trim() !== '') {
        setResults(searchIndexRef.current.search(query));
      }
    } else {
      setResults([]);
    }
  }, [workbookData]);

  // Run fuzzy search on debounced query changes
  useEffect(() => {
    if (!workbookData || !searchIndexRef.current || debouncedQuery.trim() === '') {
      setResults([]);
      return;
    }
    const matches = searchIndexRef.current.search(debouncedQuery);
    setResults(matches);
  }, [debouncedQuery, workbookData]);

  return {
    query,
    setQuery,
    results
  };
}
