interface AuthDividerLabelProps {
  label: string;
}

export function AuthDividerLabel({ label }: AuthDividerLabelProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="h-px flex-1" style={{ background: "var(--ghost-border-color)" }} />
      <span className="font-label-caps text-[10px] text-text-muted uppercase opacity-50">
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: "var(--ghost-border-color)" }} />
    </div>
  );
}
