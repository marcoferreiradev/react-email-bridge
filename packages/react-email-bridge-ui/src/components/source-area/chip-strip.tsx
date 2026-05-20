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
    <div className="flex items-center gap-1.5 px-3 h-9 border-b border-slate-6 shrink-0">
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
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
              isActive
                ? 'bg-slate-12 text-slate-1 border-slate-12 hover:bg-slate-11 hover:border-slate-11'
                : 'bg-transparent text-slate-11 border-slate-6 hover:text-slate-12 hover:border-slate-8',
            )}
          >
            <span
              className={cn(
                'inline-block w-1.5 h-1.5 rounded-full',
                isActive ? 'bg-green-500' : 'bg-slate-7',
              )}
              aria-hidden="true"
            />
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
