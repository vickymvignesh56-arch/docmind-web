import React from 'react';

export const RagFishLogo = ({ size = 32, withText = true, className = '', isDarkTheme = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ userSelect: 'none' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="fishGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="tailGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer badge background if desired */}
        <rect
          width="32"
          height="32"
          rx="9"
          fill={isDarkTheme ? '#0b1120' : '#1e293b'}
          stroke={isDarkTheme ? '#1e293b' : '#334155'}
          strokeWidth="1"
        />

        {/* Neural Nodes & Synaptic connection */}
        <circle cx="8" cy="8" r="2.5" fill="#06b6d4" filter="url(#neonBlur)" />
        <path
          d="M8 8 C 13 4, 18 6, 18 12"
          stroke="#06b6d4"
          strokeWidth="1.6"
          strokeDasharray="2 1.5"
          fill="none"
        />
        <circle cx="18" cy="12" r="2" fill="#38bdf8" />

        {/* Fish Body with RAG Flow */}
        <path
          d="M11 18 C 11 13.5, 17 13.5, 23 15.5 C 27 17, 28 19.5, 23 21.5 C 17 23.5, 11 23.5, 11 18 Z"
          fill="url(#fishGlow)"
        />

        {/* Fish Tail */}
        <polygon points="11,18 6,13.5 6,22.5" fill="url(#tailGlow)" opacity="0.9" />

        {/* AI Eye */}
        <circle cx="21" cy="16.5" r="1.3" fill="#ffffff" />
        <circle cx="21.3" cy="16.5" r="0.6" fill="#0f172a" />
      </svg>

      {withText && (
        <span
          style={{
            fontSize: size * 0.58,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: isDarkTheme ? '#ffffff' : '#0f172a',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          RAG<span style={{ color: '#2563eb' }}>FISH</span>
        </span>
      )}
    </div>
  );
};
