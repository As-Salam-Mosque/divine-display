import type { ReactNode } from "react";
import type { Language } from "../../types";
import { SkipLink } from "../common/SkipLink";

interface AuthPageShellProps {
  language: Language;
  mainId: string;
  skipLabel: string;
  children: ReactNode;
}

export function AuthPageShell({
  language,
  mainId,
  skipLabel,
  children,
}: AuthPageShellProps) {
  return (
    <div
      lang={language}
      className="dark min-h-screen bg-background-deep text-on-surface font-body-md overflow-hidden"
    >
      <SkipLink href={`#${mainId}`} label={skipLabel} />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          className="absolute rounded-full motion-safe:animate-[float_15s_ease-in-out_infinite]"
          style={{
            width: 500,
            height: 500,
            top: "-10%",
            left: "-10%",
            background: "rgba(233,193,118,0.05)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute rounded-full motion-safe:animate-[float_20s_ease-in-out_infinite_reverse]"
          style={{
            width: 400,
            height: 400,
            bottom: "-10%",
            right: "-10%",
            background: "rgba(233,193,118,0.04)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <main
        id={mainId}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
