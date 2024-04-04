import { useCallback, useEffect, useRef, useState } from 'react';

export type UseDebouncedParams = {
  initial?: string;
  delay?: number;
  // hooks
  onDebounce?: (search: string) => void;
  onChange?: (search: string) => void;
};

export function useDebounced({
  initial = '',
  delay = 150,
  onDebounce,
  onChange,
}: UseDebouncedParams = {}) {
  const ref = useRef<{ timeout?: number }>({});
  const [debouncedSearch, _setDebouncedSearch] = useState<string>(initial);

  const updateSearch = useCallback((search: string) => {
    onChange?.(search);

    clearTimeout(ref.current.timeout);
    ref.current.timeout = setTimeout(() => {
      _setDebouncedSearch(search);
      onDebounce?.(search);
    }, delay);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(ref.current.timeout);
    };
  }, []);

  return { debouncedSearch, updateSearch };
}
