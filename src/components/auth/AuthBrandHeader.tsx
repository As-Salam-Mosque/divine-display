import type { Language } from "../../types";

interface AuthBrandHeaderProps {
  language: Language;
  onHomeClick: () => void;
}

export function AuthBrandHeader({ language, onHomeClick }: AuthBrandHeaderProps) {
  return (
    <button
      type="button"
      onClick={onHomeClick}
      className="text-center mb-10 block hover:opacity-80 transition-opacity focus-ring rounded-lg bg-none border-none cursor-pointer p-0"
    >
      <div className="inline-flex items-center justify-center mb-4">
        <img src="/favicon.svg" alt="Divine Display" className="w-12 h-12" />
      </div>
      <h1 className="font-headline-md text-on-surface tracking-tight mb-2">
        Divine Display
      </h1>
      <p className="text-sm text-text-muted max-w-70 mx-auto leading-relaxed">
        {language === "fr"
          ? "Gérer les espaces sacrés avec précision technique et intentionnalité spirituelle."
          : "Managing sacred spaces with technical precision and spiritual intentionality."}
      </p>
    </button>
  );
}
