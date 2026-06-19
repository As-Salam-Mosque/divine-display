import type { Language } from "../../types";
import { cn } from "../../utils/cn";

interface AuthLanguageSwitchProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function AuthLanguageSwitch({
  language,
  onLanguageChange,
}: AuthLanguageSwitchProps) {
  return (
    <div className="absolute top-6 right-6 flex gap-2">
      <button
        type="button"
        onClick={() => onLanguageChange("en")}
        className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-label-caps tracking-widest uppercase transition-colors focus-ring",
          language === "en"
            ? "bg-primary text-black font-semibold"
            : "text-text-muted hover:text-primary hover:bg-primary/5 border",
        )}
        style={
          language !== "en" ? { borderColor: "var(--ghost-border-color)" } : {}
        }
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onLanguageChange("fr")}
        className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-label-caps tracking-widest uppercase transition-colors focus-ring",
          language === "fr"
            ? "bg-primary text-black font-semibold"
            : "text-text-muted hover:text-primary hover:bg-primary/5 border",
        )}
        style={
          language !== "fr" ? { borderColor: "var(--ghost-border-color)" } : {}
        }
      >
        FR
      </button>
    </div>
  );
}
