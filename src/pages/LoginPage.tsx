import { useState } from "react";
import { useLocation } from "wouter";
import { AuthBrandHeader } from "../components/auth/AuthBrandHeader";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthDividerLabel } from "../components/auth/AuthDividerLabel";
import { AuthErrorAlert } from "../components/auth/AuthErrorAlert";
import { AuthFooterAttribution } from "../components/auth/AuthFooterAttribution";
import { AuthLanguageSwitch } from "../components/auth/AuthLanguageSwitch";
import { AuthPageShell } from "../components/auth/AuthPageShell";
import { AuthSubmitButton } from "../components/auth/AuthSubmitButton";
import { AuthTextField } from "../components/auth/AuthTextField";
import { PasswordField } from "../components/auth/PasswordField";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useT } from "../i18n";
import { cn } from "../utils/cn";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = useT(language);

  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/mosques/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t.login.invalidCredentials);
      }

      const data = await res.json();
      login(data.session.sessionToken, data.mosque.slug);
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.login.failedToLogin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      language={language}
      mainId="login-form"
      skipLabel={t.landing.skipToMain}
    >
      <AuthLanguageSwitch language={language} onLanguageChange={setLanguage} />
      <AuthBrandHeader language={language} onHomeClick={() => setLocation("/")} />

      <AuthCard>
        {error && <AuthErrorAlert message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthTextField
            id="slug"
            icon="mail"
            label={t.login.mosqueSlug}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t.login.slugPlaceholder || "masjid-as-salam"}
            required
            autoComplete="username"
          />

          <PasswordField
            id="password"
            label={t.login.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isVisible={showPassword}
            onToggleVisibility={() => setShowPassword((v) => !v)}
            visibleAriaLabel={language === "fr" ? "Afficher le mot de passe" : "Show password"}
            hiddenAriaLabel={language === "fr" ? "Masquer le mot de passe" : "Hide password"}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />

          <AuthSubmitButton
            loading={loading}
            loadingLabel={t.login.signingIn}
            idleLabel={t.login.signIn}
          />
        </form>

        <div
          className="mt-8 pt-6 flex flex-col gap-3"
          style={{ borderTop: "1px solid var(--ghost-border-color)" }}
        >
          <button
            type="button"
            className="text-center text-sm text-text-muted hover:text-primary transition-colors duration-200 focus-ring rounded"
            title={
              language === "fr"
                ? "Contactez le support pour réinitialiser votre mot de passe"
                : "Contact support to reset your password"
            }
          >
            {t.login.forgotPassword}
          </button>

          <AuthDividerLabel
            label={language === "fr" ? "Nouvelle mosquée?" : "New Masjid?"}
          />

          <button
            onClick={() => setLocation("/register")}
            className={cn(
              "text-center text-sm text-primary font-semibold hover:underline",
              "transition-all duration-200 focus-ring rounded bg-none border-none cursor-pointer p-0",
            )}
          >
            {language === "fr" ? "Créer un compte" : "Create Account"}
          </button>
        </div>
      </AuthCard>

      <AuthFooterAttribution language={language} />
    </AuthPageShell>
  );
}
