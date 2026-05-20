interface IconDockProps {
  position: 'bottom' | 'right' | 'left' | 'hidden';
  size?: number;
  className?: string;
}

// Tiny 16x16 dock-position glyphs. Drawn as outlined rect with the
// "dock" region filled.
export function IconDock({ position, size = 16, className }: IconDockProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      className={className}
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
      {position === 'bottom' && (
        <rect x="1.5" y="10" width="13" height="4.5" fill="currentColor" stroke="none" />
      )}
      {position === 'right' && (
        <rect x="10.5" y="1.5" width="4" height="13" fill="currentColor" stroke="none" />
      )}
      {position === 'left' && (
        <rect x="1.5" y="1.5" width="4" height="13" fill="currentColor" stroke="none" />
      )}
      {position === 'hidden' && (
        <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" />
      )}
    </svg>
  );
}
