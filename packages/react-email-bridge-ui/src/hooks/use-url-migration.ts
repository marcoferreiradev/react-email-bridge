'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * One-shot rewrite of v0.1 URL params to UI v2 schema (ADR-0004 / UI-5).
 *
 * Translations:
 *   ?view=preview               → drop (UI v2 always shows preview;
 *                                 absence of ?source means "no source panes")
 *   ?view=source                → ?source=react if no ?source present
 *   ?lang=tsx|html|markdown|json → drop (replaced by ?source chip strip)
 *   ?toolbar-panel=<x>          → ?inspect-tab=<x> if no ?inspect-tab present
 *
 * Runs once per mount via a ref guard so the user can keep typing other
 * params without us thrashing the URL on every keystroke.
 */
export function useUrlMigration() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didRun = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: one-shot on mount
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const params = new URLSearchParams(searchParams);
    let changed = false;

    const legacyView = params.get('view');
    if (legacyView !== null) {
      if (!params.has('source')) {
        if (legacyView === 'source') params.set('source', 'react');
        else if (legacyView === 'preview') params.set('source', '');
      }
      params.delete('view');
      changed = true;
    }

    if (params.has('lang')) {
      params.delete('lang');
      changed = true;
    }

    const legacyToolbar = params.get('toolbar-panel');
    if (legacyToolbar !== null) {
      if (!params.has('inspect-tab')) {
        params.set('inspect-tab', legacyToolbar);
      }
      params.delete('toolbar-panel');
      changed = true;
    }

    if (changed) {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}${location.hash}`);
    }
  }, []);
}
