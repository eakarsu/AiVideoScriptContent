import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  page: number;
}

const defaults: FilterState = {
  searchTerm: '',
  statusFilter: 'all',
  sortBy: 'createdAt_DESC',
  page: 1,
};

export function usePersistedFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: FilterState = useMemo(() => ({
    searchTerm: searchParams.get('q') || defaults.searchTerm,
    statusFilter: searchParams.get('status') || defaults.statusFilter,
    sortBy: searchParams.get('sort') || defaults.sortBy,
    page: parseInt(searchParams.get('page') || '1', 10) || defaults.page,
  }), [searchParams]);

  const setFilter = useCallback((key: keyof FilterState, value: string | number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const paramMap: Record<keyof FilterState, string> = {
        searchTerm: 'q',
        statusFilter: 'status',
        sortBy: 'sort',
        page: 'page',
      };
      const paramKey = paramMap[key];
      const defaultValue = String(defaults[key]);

      if (String(value) === defaultValue) {
        next.delete(paramKey);
      } else {
        next.set(paramKey, String(value));
      }
      // Reset page to 1 when filters change (except when changing page itself)
      if (key !== 'page') {
        next.delete('page');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return { filters, setFilter };
}
