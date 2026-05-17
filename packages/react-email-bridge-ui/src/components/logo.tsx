import * as React from 'react';

/**
 * Brand mark for react-email-bridge. Distinct from the upstream React Email
 * logo to avoid confusion (the UI is forked from @react-email/ui).
 */
export const Logo = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: 0.95,
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="6"
          width="28"
          height="20"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M4 9l12 8 12-8"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        <text
          x="16"
          y="23"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="6"
          fontWeight="700"
          fill="currentColor"
          letterSpacing="0.5"
        >
          {`{{ }}`}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>react-email</span>
        <span style={{ fontSize: '11px', opacity: 0.7 }}>bridge</span>
      </div>
    </div>
  );
};
