// Input Primitive (Platform-Agnostic Pattern)

import React from 'react';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel';
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  maxLength?: number;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      value,
      onChangeText,
      placeholder,
      type = 'text',
      label,
      error,
      disabled = false,
      required = false,
      className = '',
      inputMode,
      maxLength,
    },
    ref
  ) {
    const id = React.useId();

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-neutral-700">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          inputMode={inputMode}
          maxLength={maxLength}
          className={`
          px-3 py-2 border rounded-lg min-touch
          bg-white text-neutral-900
          placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-neutral-300'}
        `}
        />
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    );
  }
);

