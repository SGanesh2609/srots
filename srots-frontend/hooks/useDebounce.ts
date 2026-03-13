import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating a value until the user stops changing it.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchQuery, 350);
 *   useEffect(() => { fetchData(debouncedSearch); }, [debouncedSearch]);
 *
 * This prevents an API call on every keystroke — the effect only fires
 * after the user pauses for `delay` ms.
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
