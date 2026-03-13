import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * useUrlParam — syncs a single URL search parameter with React state.
 *
 * Reads the initial value from the URL and returns a setter that updates
 * the URL non-destructively (preserves all other params).
 *
 * @param key          URL search param key (e.g. 'status', 'tab')
 * @param defaultValue Value to return when the param is absent / empty
 *
 * Usage:
 *   const [tab, setTab] = useUrlParam('ptab', 'all');
 */
export function useUrlParam(key: string, defaultValue: string): [string, (v: string) => void] {
    const [searchParams, setSearchParams] = useSearchParams();
    const value = searchParams.get(key) ?? defaultValue;

    const setValue = useCallback(
        (newValue: string) => {
            setSearchParams(
                prev => {
                    const p = new URLSearchParams(prev);
                    if (newValue !== defaultValue) p.set(key, newValue);
                    else p.delete(key);
                    return p;
                },
                { replace: true }
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key, defaultValue]
    );

    return [value, setValue];
}

/**
 * useUrlArrayParam — syncs a comma-separated URL search parameter with a string[].
 *
 * @param key URL search param key (e.g. 'types', 'modes')
 *
 * Usage:
 *   const [types, setTypes] = useUrlArrayParam('jtypes');
 */
export function useUrlArrayParam(key: string): [string[], (v: string[]) => void] {
    const [searchParams, setSearchParams] = useSearchParams();
    const raw = searchParams.get(key);
    const value = useMemo(() => (raw ? raw.split(',').filter(Boolean) : []), [raw]);

    const setValue = useCallback(
        (newValues: string[]) => {
            setSearchParams(
                prev => {
                    const p = new URLSearchParams(prev);
                    if (newValues.length > 0) p.set(key, newValues.join(','));
                    else p.delete(key);
                    return p;
                },
                { replace: true }
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );

    return [value, setValue];
}
