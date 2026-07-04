import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export const inputCls =
  "w-full rounded-lg py-2.5 px-3 text-sm text-on-surface bg-surface-container " +
  "ghost-border focus:outline-none focus:ring-2 focus:ring-primary/25 " +
  "transition-all placeholder:text-text-muted font-body-md";

export const textareaCls =
  "w-full rounded-lg py-2.5 px-3 text-sm text-on-surface bg-surface-container " +
  "ghost-border focus:outline-none focus:ring-2 focus:ring-primary/25 " +
  "transition-all placeholder:text-text-muted font-body-md resize-y";

export const selectCls =
  "w-full rounded-lg py-2.5 px-3 text-sm text-on-surface bg-surface-container " +
  "ghost-border focus:outline-none focus:ring-2 focus:ring-primary/25 " +
  "transition-all font-body-md";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[13px] font-medium text-text-muted mb-1.5"
    >
      {children}
    </label>
  );
}

export function Field({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function SectionCard({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="bg-surface-panel ghost-border rounded-xl p-5 sm:p-6 scroll-mt-24"
      aria-labelledby={`${id}-heading`}
    >
      <div
        className="flex items-center gap-3 mb-5 pb-4"
        style={{ borderBottom: "1px solid var(--ghost-border-color)" }}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
          <span
            className="material-symbols-outlined text-primary filled"
            style={{ fontSize: 18 }}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>
        <div>
          <h2
            id={`${id}-heading`}
            className="font-headline-md text-on-surface leading-snug"
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm text-text-muted mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full",
          "border-2 border-transparent transition-colors focus-ring",
          checked ? "bg-primary" : "bg-surface-container",
        )}
        style={checked ? {} : { border: "1px solid var(--ghost-border-color)" }}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
      {label && (
        <span
          className="cursor-pointer select-none text-sm text-on-surface"
          onClick={() => onChange(!checked)}
          aria-hidden="true"
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function AddRowBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1 font-label-caps text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary/10 focus-ring"
      style={{ border: "1px solid rgba(var(--primary-rgb), 0.3)" }}
    >
      {children}
    </button>
  );
}

export function RemoveBtn({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 font-label-caps text-xs uppercase tracking-widest transition-colors focus-ring text-red-400 hover:bg-red-500/10"
      style={{ border: "1px solid rgba(239,68,68,0.3)" }}
    >
      {label}
    </button>
  );
}
