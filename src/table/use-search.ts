import { useCallback, useState } from 'react';

export type UseSearchParams = {
  initial?: string;
};

export function useSearch({ initial = '' }: UseSearchParams = {}) {
  const [search, setSearch] = useState<string>(initial);

  const resetSearch = useCallback(() => {
    setSearch(initial);
  }, [initial]);

  const clearSearch = useCallback(() => {
    setSearch('');
  }, []);

  return { search, setSearch, resetSearch, clearSearch };
}
