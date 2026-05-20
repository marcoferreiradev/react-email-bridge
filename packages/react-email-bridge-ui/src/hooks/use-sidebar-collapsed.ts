'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'reb-sidebar-collapsed';

function readFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Sidebar collapsed state (ADR-0004 / UI-4).
 *
 * Persisted to localStorage — personal preference, not URL state. Defaults
 * to expanded on first visit. SSR-safe: always returns `false` on first
 * render, then hydrates from localStorage in an effect.
 */
export function useSidebarCollapsed(): readonly [boolean, (next: boolean) => void] {
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    setCollapsedState(readFromStorage());
  }, []);

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // localStorage unavailable — in-memory only
    }
  }, []);

  return [collapsed, setCollapsed] as const;
}
