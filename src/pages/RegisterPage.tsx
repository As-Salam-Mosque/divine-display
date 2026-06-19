import { useState } from "react";
import { useLocation } from "wouter";
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
    <div
      lang={language}
      className="dark min-h-screen bg-background-deep text-on-surface font-body-md overflow-hidden"
    >
      {/* Skip link */}
      <a
        href="#register-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-black focus:rounded-lg focus:font-semibold"
      >
        {t.landing.skipToMain}
      </a>

      {/* Ambient orbs */}
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
        id="register-form"
        className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6"
        tabIndex={-1}
      >
        {/* Language selector */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-label-caps tracking-widest uppercase transition-colors focus-ring",
              language === "en"
                ? "bg-primary text-black font-semibold"
                : "text-text-muted hover:text-primary hover:bg-primary/5 border",
            )}
            style={
              language !== "en"
                ? { borderColor: "var(--ghost-border-color)" }
                : undefined
            }
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("fr")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-label-caps tracking-widest uppercase transition-colors focus-ring",
              language === "fr"
                ? "bg-primary text-black font-semibold"
                : "text-text-muted hover:text-primary hover:bg-primary/5 border",
            )}
            style={
              language !== "fr"
                ? { borderColor: "var(--ghost-border-color)" }
                : undefined
            }
          >
            FR
          </button>
        </div>

        {/* Branding header */}
        <button
          onClick={() => setLocation("/")}
          className="text-center mb-10 block hover:opacity-80 transition-opacity focus-ring rounded-lg bg-none border-none cursor-pointer p-0"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/favicon.svg"
              alt="Divine Display"
              className="w-12 h-12"
            />
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

        {/* Register card */}
        <div
          className="w-full max-w-105 border rounded-xl p-8 shadow-2xl"
          style={{
            backdropFilter: "blur(12px)",
            background: "rgba(12, 18, 38, 0.7)",
            borderColor: "var(--ghost-border-color)",
          }}
        >
          {/* Error message */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 p-4 rounded-lg bg-surface-container border border-primary/20 text-primary text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Slug field */}
            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="block font-label-caps text-text-muted uppercase tracking-widest text-xs"
              >
                {t.register.mosqueSlug}
              </label>
              <div className="relative flex items-center">
                <span
                  className="absolute left-3 text-text-muted material-symbols-outlined pointer-events-none"
                  style={{ fontSize: 20 }}
                  aria-hidden="true"
                >
                  tag
                </span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={cn(
                    "w-full bg-surface-container border rounded-lg py-3 pl-10 pr-4",
                    "text-on-surface placeholder:text-text-muted font-body-md",
                    "focus:outline-none focus:border-primary transition-all duration-300",
                    "border-ghost-border-color",
                  )}
                  style={{ borderColor: "var(--ghost-border-color)" }}
                  placeholder="masjid-as-salam"
                  required
                  autoComplete="username"
                />
              </div>
              <p className="text-xs text-text-muted">
                {t.register.slugDescription}
              </p>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block font-label-caps text-text-muted uppercase tracking-widest text-xs"
              >
                {t.register.password}
              </label>
              <div className="relative flex items-center">
                <span
                  className="absolute left-3 text-text-muted material-symbols-outlined pointer-events-none"
                  style={{ fontSize: 20 }}
                  aria-hidden="true"
                >
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full bg-surface-container border rounded-lg py-3 pl-10 pr-12",
                    "text-on-surface placeholder:text-text-muted font-body-md",
                    "focus:outline-none focus:border-primary transition-all duration-300",
                  )}
                  style={{ borderColor: "var(--ghost-border-color)" }}
                  placeholder="••••••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? t.register.hidePassword
                      : t.register.showPassword
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors focus-ring rounded"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                    aria-hidden="true"
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block font-label-caps text-text-muted uppercase tracking-widest text-xs"
              >
                {t.register.confirmPassword}
              </label>
              <div className="relative flex items-center">
                <span
                  className="absolute left-3 text-text-muted material-symbols-outlined pointer-events-none"
                  style={{ fontSize: 20 }}
                  aria-hidden="true"
                >
                  lock
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "w-full bg-surface-container border rounded-lg py-3 pl-10 pr-12",
                    "text-on-surface placeholder:text-text-muted font-body-md",
                    "focus:outline-none focus:border-primary transition-all duration-300",
                  )}
                  style={{ borderColor: "var(--ghost-border-color)" }}
                  placeholder={
                    language === "fr"
                      ? "Confirmer le mot de passe"
                      : "Re-enter password"
                  }
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword
                      ? t.register.hidePassword
                      : t.register.showPassword
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors focus-ring rounded"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                    aria-hidden="true"
                  >
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full gold-button rounded-lg py-4 font-bold font-body-md",
                "flex items-center justify-center gap-2",
                "hover:brightness-110 active:scale-[0.98] transition-all duration-200",
                "shadow-lg",
                loading && "opacity-70 cursor-not-allowed",
              )}
              style={{ boxShadow: "0 4px 24px rgba(233,193,118,0.10)" }}
            >
              {loading ? (
                <>
                  <span
                    className="material-symbols-outlined motion-safe:animate-spin"
                    style={{ fontSize: 20 }}
                    aria-hidden="true"
                  >
                    sync
                  </span>
                  {t.register.creatingAccount}
                </>
              ) : (
                t.register.createAccount
              )}
            </button>
          </form>

          {/* Footer links */}
          <div
            className="mt-8 pt-6 flex flex-col gap-3"
            style={{ borderTop: "1px solid var(--ghost-border-color)" }}
          >
            {/* Divider with label */}
            <div className="flex items-center justify-center gap-2">
              <div
                className="h-px flex-1"
                style={{ background: "var(--ghost-border-color)" }}
              />
              <span className="font-label-caps text-[10px] text-text-muted uppercase opacity-50">
                {t.register.alreadyRegistered}
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "var(--ghost-border-color)" }}
              />
            </div>

            <button
              onClick={() => setLocation("/login")}
              className="text-center text-sm text-primary font-semibold hover:underline transition-all duration-200 focus-ring rounded bg-none border-none cursor-pointer p-0"
            >
              {t.register.signInInstead}
            </button>
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="mt-12 text-center">
          <p className="font-label-caps text-[11px] text-text-muted opacity-40 uppercase tracking-[0.2em]">
            © 2026 Divine Display •{" "}
            {language === "fr"
              ? "Opérations sécurisées de mosquée"
              : "Secure Mosque Operations"}
          </p>
        </div>
      </main>
    </div>
  );
}
