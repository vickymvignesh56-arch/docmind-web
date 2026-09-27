import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../Button/Button';
import './ErrorMessage.css';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div className={`error-banner ${className}`} role="alert">
      <AlertCircle size={18} className="error-banner-icon" />
      <div className="error-banner-content">
        <h4 className="error-banner-title">{title}</h4>
        <p className="error-banner-message">{message}</p>
        {onRetry && (
          <div className="error-banner-actions">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={onRetry}
              style={{
                borderColor: '#fca5a5',
                color: '#b91c1c',
                backgroundColor: '#ffffff',
              }}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
