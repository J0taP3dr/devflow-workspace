import { useCallback, useEffect, useState } from 'react';
import type { ZodType } from 'zod';
export function readStored<T>(key: string, schema: ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}
/** Versioned keys and runtime validation keep stale browser data out of domain state.
 * Cross-tab updates are last-write-wins; this is not a collaborative backend. */
export function useStored<T>(key: string, schema: ZodType<T>, fallback: T) {
  const [value, setValue] = useState<T>(() =>
    readStored(key, schema, fallback),
  );
  const [warning, setWarning] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setWarning('');
    } catch {
      setWarning(
        'Armazenamento indisponível. As alterações estão apenas nesta sessão.',
      );
    }
  }, [key, value]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === key) setValue(readStored(key, schema, fallback));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key, schema, fallback]);
  const update = useCallback((next: T | ((old: T) => T)) => setValue(next), []);
  return [value, update, warning] as const;
}
