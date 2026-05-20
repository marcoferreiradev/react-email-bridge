'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { DockPosition } from '../hooks/use-inspection-dock';
import { cn } from '../utils';
import { IconDock } from './icons/icon-dock';

interface InspectionDockMenuProps {
  position: DockPosition;
  onChange: (next: DockPosition) => void;
}

const OPTIONS: { value: DockPosition; label: string; hint: string }[] = [
  { value: 'bottom', label: 'Bottom', hint: 'Horizontal strip below preview' },
  { value: 'right', label: 'Right', hint: 'Vertical panel on the right' },
  { value: 'left', label: 'Left', hint: 'Vertical panel on the left' },
  { value: 'hidden', label: 'Hide', hint: 'Reopen from the topbar' },
];

export function InspectionDockMenu({ position, onChange }: InspectionDockMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Dock inspection panel"
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-md',
            'text-slate-11 hover:text-slate-12 hover:bg-slate-4 transition-colors outline-none',
          )}
        >
          <IconDock position={position === 'hidden' ? 'bottom' : position} size={14} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] rounded-xl p-1.5 shadow-2xl z-50 border border-white/10"
          style={{ backgroundColor: '#0c0c0c' }}
          sideOffset={6}
          align="end"
          side="top"
        >
          {OPTIONS.map((opt) => {
            const isActive = position === opt.value;
            return (
              <DropdownMenu.Item
                key={opt.value}
                onSelect={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                }}
                className={cn(
                  'flex items-center gap-2.5 p-2 rounded-lg cursor-pointer outline-none transition-colors',
                  isActive ? 'bg-white/10' : 'hover:bg-white/5',
                )}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10"
                  style={{ backgroundColor: '#161616' }}
                >
                  <IconDock
                    position={opt.value === 'hidden' ? 'hidden' : opt.value}
                    size={14}
                    className="text-slate-11"
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xs font-medium text-white">
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-white/40">{opt.hint}</span>
                </div>
                {isActive ? (
                  <span className="text-[10px] uppercase tracking-wider text-cyan-400">
                    on
                  </span>
                ) : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
