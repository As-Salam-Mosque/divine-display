import type { ChangeEventHandler } from "react";
import { cn } from "../../utils/cn";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  isVisible: boolean;
  onToggleVisibility: () => void;
  visibleAriaLabel: string;
  hiddenAriaLabel: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
  visibleAriaLabel,
  hiddenAriaLabel,
  placeholder,
  autoComplete,
  required = false,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block font-label-caps text-text-muted uppercase tracking-widest text-xs"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <span
          className="absolute left-3 text-text-muted material-symbols-outlined pointer-events-none"
          style={{ fontSize: 20 }}
          aria-hidden="true"
        >
          lock
        </span>
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full bg-surface-container border rounded-lg py-3 pl-10 pr-12",
            "text-on-surface placeholder:text-text-muted font-body-md",
            "focus:outline-none focus:border-primary transition-all duration-300",
          )}
          style={{ borderColor: "var(--ghost-border-color)" }}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={isVisible ? hiddenAriaLabel : visibleAriaLabel}
          className="absolute inset-y-0 right-3 my-auto h-6 w-6 inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors focus-ring rounded"
        >
          <span
            className="material-symbols-outlined leading-none"
            style={{ fontSize: 20 }}
            aria-hidden="true"
          >
            {isVisible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}
