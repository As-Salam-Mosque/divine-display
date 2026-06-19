import type { Language } from "../../types";

interface AuthFooterAttributionProps {
  language: Language;
}

export function AuthFooterAttribution({ language }: AuthFooterAttributionProps) {
  return (
    <div className="mt-12 text-center">
      <p className="font-label-caps text-[11px] text-text-muted opacity-40 uppercase tracking-[0.2em]">
        © 2026 Divine Display •{" "}
        {language === "fr"
          ? "Opérations sécurisées de mosquée"
          : "Secure Mosque Operations"}
      </p>
    </div>
  );
}
