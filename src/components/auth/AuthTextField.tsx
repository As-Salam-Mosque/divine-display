import type { ChangeEventHandler } from "react";
import { cn } from "../../utils/cn";

interface AuthTextFieldProps {
  id: string;
  label: string;
  icon: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  description?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
}

export function AuthTextField({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  required = false,
  description,
  lang,
  dir,
}: AuthTextFieldProps) {
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
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full bg-surface-container border rounded-lg py-3 pl-10 pr-4",
            "text-on-surface placeholder:text-text-muted font-body-md",
            "focus:outline-none focus:border-primary transition-all duration-300",
          )}
          style={{ borderColor: "var(--ghost-border-color)" }}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          lang={lang}
          dir={dir}
        />
      </div>
      {description && <p className="text-xs text-text-muted">{description}</p>}
    </div>
  );
}
