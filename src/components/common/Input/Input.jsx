import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Input.css';

export const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      id,
      name,
      value,
      onChange,
      placeholder,
      error,
      helperText,
      icon: Icon,
      required = false,
      disabled = false,
      isDark = false,
      className = '',
      as = 'input', // 'input' | 'textarea' | 'select'
      rows = 3,
      children,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || name || Math.random().toString(36).substring(2, 7);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`input-group ${isDark ? 'input-group-dark' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            <span>
              {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
            </span>
          </label>
        )}

        <div className="input-wrapper">
          {Icon && (
            <div className="input-icon-left">
              <Icon size={16} />
            </div>
          )}

          {as === 'textarea' ? (
            <textarea
              id={inputId}
              name={name}
              ref={ref}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              className={`input-field ${error ? 'has-error' : ''} ${Icon ? 'input-with-icon-left' : ''}`}
              {...props}
            />
          ) : as === 'select' ? (
            <select
              id={inputId}
              name={name}
              ref={ref}
              value={value}
              onChange={onChange}
              disabled={disabled}
              className={`input-field ${error ? 'has-error' : ''} ${Icon ? 'input-with-icon-left' : ''}`}
              {...props}
            >
              {children}
            </select>
          ) : (
            <input
              id={inputId}
              name={name}
              type={computedType}
              ref={ref}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className={`input-field ${error ? 'has-error' : ''} ${Icon ? 'input-with-icon-left' : ''} ${
                isPassword ? 'input-with-icon-right' : ''
              }`}
              {...props}
            />
          )}

          {isPassword && (
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && (
          <div className="input-error-msg">
            <AlertCircle size={13} />
            <span>{error}</span>
          </div>
        )}

        {helperText && !error && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: isDark ? '#64748b' : '#64748b' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
