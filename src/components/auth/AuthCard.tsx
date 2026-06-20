import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      className="w-full max-w-105 border rounded-xl p-8 shadow-2xl"
      style={{
        backdropFilter: "blur(12px)",
        background: "rgba(12, 18, 38, 0.7)",
        borderColor: "var(--ghost-border-color)",
      }}
    >
      {children}
    </div>
  );
}
