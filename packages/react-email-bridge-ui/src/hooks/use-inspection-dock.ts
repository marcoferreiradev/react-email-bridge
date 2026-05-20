'use client';

import { useCallback, useEffect, useState } from 'react';

export type DockPosition = 'bottom' | 'right' | 'left' | 'hidden';

const STORAGE_KEY = 'reb-inspection-dock';
const DEFAULT_POSITION: DockPosition = 'bottom';
const VALID_POSITIONS: readonly DockPosition[] = [
  'bottom',
  'right',
  'left',
  'hidden',
] as const;

function isValidPosition(value: unknown): value is DockPosition {
  return (
    typeof value === 'string' && VALID_POSITIONS.includes(value as DockPosition)
  );
}

function readFromStorage(): DockPosition {
  if (typeof window === 'undefined') return DEFAULT_POSITION;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isValidPosition(raw) ? raw : DEFAULT_POSITION;
  } catch {
    return DEFAULT_POSITION;
  }
}

/**
 * Inspection panel dock position (ADR-0004 / UI-3).
 *
 * Defaults to `bottom` (matches v0.1 layout). Persists across reloads via
 * localStorage — pure personal preference, not URL state (see ADR-0004
 * point 4: P3 hybrid persistence).
 */
export function useInspectionDock(): readonly [DockPosition, (next: DockPosition) => void] {
  // Always start from default on first render to avoid SSR/client mismatch.
  // We hydrate from localStorage in an effect once mounted.
  const [position, setPositionState] = useState<DockPosition>(DEFAULT_POSITION);

  useEffect(() => {
    setPositionState(readFromStorage());
  }, []);

  const setPosition = useCallback((next: DockPosition) => {
    setPositionState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private mode, quota) — fall back to in-memory only
    }
  }, []);

  return [position, setPosition] as const;
}
