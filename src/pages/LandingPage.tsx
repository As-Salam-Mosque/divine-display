import { useState } from "react";
import { LandingHeaderBar } from "../components/LandingHeaderBar";
import { useT } from "../i18n";
import type { Language } from "../types";

export function LandingPage() {
  const [language, setLanguage] = useState<Language>(() =>
    navigator.language?.startsWith("fr") ? "fr" : "en",
  );
  const t = useT(language);

  const navItems = [
    { label: t.landing.navHome, href: "#home" },
    { label: t.landing.navAbout, href: "#about" },
    { label: t.landing.navFeatures, href: "#features" },
    { label: t.landing.navPartners, href: "#partners" },
    { label: t.landing.navContact, href: "#contact" },
  ];

  const visionItems = [
    {
      icon: "verified_user",
      title: t.landing.visionHalalTitle,
      description: t.landing.visionHalalDescription,
    },
    {
      icon: "groups",
      title: t.landing.visionCommunityTitle,
      description: t.landing.visionCommunityDescription,
    },
    {
      icon: "public",
      title: t.landing.visionFreedomTitle,
      description: t.landing.visionFreedomDescription,
    },
  ];

  const featureItems = [
    {
      icon: "schedule",
      title: t.landing.featureRealtimeTitle,
      description: t.landing.featureRealtimeDescription,
    },
    {
      icon: "campaign",
      title: t.landing.featureAnnouncementsTitle,
      description: t.landing.featureAnnouncementsDescription,
    },
    {
      icon: "art_track",
      title: t.landing.featurePostersTitle,
      description: t.landing.featurePostersDescription,
    },
    {
      icon: "trending_up",
      title: t.landing.featurePromotionsTitle,
      description: t.landing.featurePromotionsDescription,
    },
    {
      icon: "devices",
      title: t.landing.featureDevicesTitle,
      description: t.landing.featureDevicesDescription,
    },
    {
      icon: "auto_awesome",
      title: t.landing.featureUpdatesTitle,
      description: t.landing.featureUpdatesDescription,
    },
  ];

  return (
    <div
      lang={language}
      className="dark min-h-screen bg-background-deep text-on-surface font-body-md"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-black focus:rounded-lg focus:font-semibold"
      >
        {t.landing.skipToMain}
      </a>
      <LandingHeaderBar
        primaryNavLabel={t.landing.primaryNav}
        brand={t.landing.brand}
        joinUs={t.landing.joinUs}
        languageToggleLabel={t.landing.languageToggle}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        navItems={navItems}
      />

      <main id="main-content" className="pt-20" tabIndex={-1}>
        <section
          id="home"
          className="scroll-mt-24 overflow-hidden px-5 py-24 md:px-8"
        >
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="mb-6 text-5xl leading-tight font-bold lg:text-7xl">
                {t.landing.heroTitleLead} <br />
                <span className="text-primary italic">
                  {t.landing.heroTitleHighlight}
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-lg text-text-muted">
                {t.landing.heroDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#partners"
                  className="gold-button rounded-lg px-8 py-4 font-semibold focus-ring"
                >
                  {t.landing.heroJoin}
                </a>
                <a
                  href="/?name=''"
                  className="rounded-lg border border-primary-25 px-8 py-4 font-semibold text-primary transition-colors hover:bg-primary-10 focus-ring"
                >
                  {t.landing.liveDemo}
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-2xl border border-outline-variant shadow-[0_0_30px_rgba(233,193,118,0.15)]">
                <img
                  src="/screenshot.png"
                  alt={t.landing.heroImageAlt}
                  className="block h-auto w-full"
                />
              </div>
              <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
              <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-surface-panel blur-[80px]" />
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-y border-outline-variant bg-surface/30 px-5 py-20 md:px-8"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-2 block text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                {t.landing.perspective}
              </span>
              <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
                {t.landing.ourVision}
              </h2>
              <p className="text-lg text-text-muted">
                {t.landing.visionDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {visionItems.map((item) => (
                <article
                  key={item.title}
                  className="flat-card ghost-border rounded-xl p-8 text-center"
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant bg-background-deep">
                    <span
                      className="material-symbols-outlined text-3xl text-primary"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold">{item.title}</h3>
                  <p className="text-text-muted">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 px-5 py-20 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <span className="mb-2 block text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                  {t.landing.capabilities}
                </span>
                <h2 className="text-4xl font-bold lg:text-5xl">
                  {t.landing.premiumFeatures}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featureItems.map((item) => (
                <article
                  key={item.title}
                  className="flex gap-4 border-b border-outline-variant p-4"
                >
                  <span
                    className="material-symbols-outlined shrink-0 text-3xl text-primary"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="mb-1 text-xl font-semibold">{item.title}</h3>
                    <p className="text-text-muted">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="partners"
          className="scroll-mt-24 bg-surface-container px-5 py-20 md:px-8"
        >
          <div className="mx-auto mb-12 w-full max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl">
              {t.landing.partnersHeading}
            </h2>
            <p className="mt-3 text-lg text-text-muted">
              {t.landing.partnersSubheading}
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
            <article className="ghost-border rounded-2xl bg-surface-panel p-8">
              <span className="mb-2 block text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                {t.landing.forCommunities}
              </span>
              <h3 className="mb-4 text-4xl font-bold">{t.landing.mosque}</h3>
              <p className="mb-7 text-lg text-text-muted">
                {t.landing.mosqueDescription}
              </p>
              <a
                href="#contact"
                className="gold-button rounded-lg px-8 py-4 font-semibold focus-ring"
              >
                {t.landing.registerMosque}
              </a>
            </article>

            <article className="ghost-border rounded-2xl bg-surface-panel p-8">
              <span className="mb-2 block text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                {t.landing.forPartners}
              </span>
              <h3 className="mb-4 text-4xl font-bold">
                {t.landing.businessPartner}
              </h3>
              <p className="mb-7 text-lg text-text-muted">
                {t.landing.businessDescription}
              </p>
              <a
                href="#contact"
                className="gold-button rounded-lg px-8 py-4 font-semibold focus-ring"
              >
                {t.landing.contactSales}
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className="scroll-mt-24 border-t border-outline-variant bg-background-deep px-5 py-16 md:px-8"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <p className="mb-4 text-2xl font-semibold text-primary">
              {t.landing.brand}
            </p>
            <p className="text-text-muted">{t.landing.footerDescription}</p>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              {t.landing.legal}
            </p>
            <p className="text-text-muted">{t.landing.privacyPolicy}</p>
            <p className="mt-2 text-text-muted">{t.landing.termsOfService}</p>
            <p className="mt-2 text-text-muted">{t.landing.adPolicy}</p>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              {t.landing.contact}
            </p>
            <p className="text-text-muted">assalam@divinedisplay.ca</p>
            <p className="mt-2 text-text-muted">Montréal, CA, Canada</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
