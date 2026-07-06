import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hint?: ReactNode;
}

export function Input({ label, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? (typeof label === 'string' ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <label className={`ds-field ${className}`.trim()} htmlFor={inputId}>
      <span className="ds-field-label">{label}</span>
      <input id={inputId} className="ds-input" {...props} />
      {hint ? <span className="ds-field-hint">{hint}</span> : null}
    </label>
  );
}
