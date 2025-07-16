import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  disabled,
  error,
  value,
  onChange,
  className = 'form-input',
  required = false,
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        className={className}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
