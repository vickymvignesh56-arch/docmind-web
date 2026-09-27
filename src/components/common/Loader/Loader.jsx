import React from 'react';
import { Loader2 } from 'lucide-react';
import { RagFishLogo } from '../RagFishLogo';
import './Loader.css';

export const Loader = ({
  fullScreen = false,
  message = 'Loading...',
  size = 32,
  inline = false,
}) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <RagFishLogo size={56} className="animate-pulse" />
        <div className="flex items-center gap-2 mt-2">
          <Loader2 className="animate-spin text-blue-600" size={20} color="var(--color-primary)" />
          <span className="loader-text">{message}</span>
        </div>
      </div>
    );
  }

  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin" size={size} color="var(--color-primary)" />
        {message && <span className="loader-text">{message}</span>}
      </div>
    );
  }

  return (
    <div className="loader-container">
      <Loader2 className="animate-spin" size={size} color="var(--color-primary)" />
      {message && <p className="loader-text">{message}</p>}
    </div>
  );
};

export const CardSkeleton = () => <div className="skeleton skeleton-card" />;
export const TextSkeleton = ({ width = '100%', height = '16px' }) => (
  <div className="skeleton skeleton-text" style={{ width, height }} />
);
