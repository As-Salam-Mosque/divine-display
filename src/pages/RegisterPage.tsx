import { useState } from "react";
import { useLocation } from "wouter";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthDividerLabel } from "../components/auth/AuthDividerLabel";
import { AuthErrorAlert } from "../components/auth/AuthErrorAlert";
import { AuthFooterAttribution } from "../components/auth/AuthFooterAttribution";
import { AuthPageShell } from "../components/auth/AuthPageShell";
import { AuthSubmitButton } from "../components/auth/AuthSubmitButton";
import { AuthTextField } from "../components/auth/AuthTextField";
import { LandingHeaderBar } from "../components/HeaderBar";
import { PasswordField } from "../components/auth/PasswordField";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useT } from "../i18n";
import { cn } from "../utils/cn";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

export function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = useT(language);

  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t.register.passwordsMismatch);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError(t.register.passwordTooShort);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/mosques/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t.register.failedToRegister);
      }

      const data = await res.json();
      login(data.session.sessionToken, data.mosque.slug);
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t.register.failedToRegister,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      language={language}
      mainId="register-form"
      skipLabel={t.landing.skipToMain}
    >
      <LandingHeaderBar
        primaryNavLabel={t.landing.primaryNav}
        brand={t.landing.brand}
        brandHref="/"
        onBrandClick={() => setLocation("/")}
        languageToggleLabel={t.landing.languageToggle}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        action={{ label: t.login.signIn, onClick: () => setLocation("/login") }}
      />

      <AuthCard>
        {error && <AuthErrorAlert message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthTextField
            id="slug"
            icon="tag"
            label={t.register.mosqueSlug}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="masjid-as-salam"
            required
            autoComplete="username"
            description={t.register.slugDescription}
          />

          <PasswordField
            id="password"
            label={t.register.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isVisible={showPassword}
            onToggleVisibility={() => setShowPassword((v) => !v)}
            visibleAriaLabel={t.register.showPassword}
            hiddenAriaLabel={t.register.hidePassword}
            placeholder="••••••••••••"
            required
            autoComplete="new-password"
          />

          <PasswordField
            id="confirmPassword"
            label={t.register.confirmPassword}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isVisible={showConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword((v) => !v)}
            visibleAriaLabel={t.register.showPassword}
            hiddenAriaLabel={t.register.hidePassword}
            placeholder={
              language === "fr"
                ? "Confirmer le mot de passe"
                : "Re-enter password"
            }
            required
            autoComplete="new-password"
          />

          <AuthSubmitButton
            loading={loading}
            loadingLabel={t.register.creatingAccount}
            idleLabel={t.register.createAccount}
          />
        </form>

        <div
          className="mt-8 pt-6 flex flex-col gap-3"
          style={{ borderTop: "1px solid var(--ghost-border-color)" }}
        >
          <AuthDividerLabel label={t.register.alreadyRegistered} />

          <button
            onClick={() => setLocation("/login")}
            className={cn(
              "text-center text-sm text-primary font-semibold hover:underline",
              "transition-all duration-200 focus-ring rounded bg-none border-none cursor-pointer p-0",
            )}
          >
            {t.register.signInInstead}
          </button>
        </div>
      </AuthCard>

      <AuthFooterAttribution language={language} />
    </AuthPageShell>
  );
}
