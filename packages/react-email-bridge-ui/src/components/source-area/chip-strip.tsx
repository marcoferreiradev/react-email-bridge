'use client';

import { cn } from '../../utils';
import { SOURCE_KINDS, SOURCE_LABELS, type SourceKind } from './types';

interface ChipStripProps {
  active: SourceKind[];
  onToggle: (kind: SourceKind) => void;
}

export function ChipStrip({ active, onToggle }: ChipStripProps) {
  const activeSet = new Set(active);
  return (
    <div className="flex items-center gap-1 px-3 h-9 border-b border-slate-6 shrink-0">
      {SOURCE_KINDS.map((kind) => {
        const isActive = activeSet.has(kind);
        return (
          <button
            key={kind}
            type="button"
            data-active={isActive}
            aria-pressed={isActive}
            onClick={() => onToggle(kind)}
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-colors outline-none',
              isActive
                ? 'text-slate-12 border border-slate-8 bg-slate-3 hover:bg-slate-4'
                : 'text-slate-10 border border-transparent hover:text-slate-12 hover:bg-slate-3',
            )}
          >
            {SOURCE_LABELS[kind]}
          </button>
        );
      })}
      <div className="ml-auto text-[10px] uppercase tracking-wider text-slate-9 font-medium">
        {active.length}/4 source{active.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}
