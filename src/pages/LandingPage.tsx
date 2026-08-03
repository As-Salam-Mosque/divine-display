import { useLocation } from "wouter";
import { LandingHeaderBar } from "../components/HeaderBar";
import { PartnerCard } from "../components/PartnerCard";
import { SkipLink } from "../components/common/SkipLink";
import { useLanguage } from "../context/LanguageContext";
import { useT } from "../i18n";

export function LandingPage() {
  const [, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();
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
      <SkipLink href="#main-content" label={t.landing.skipToMain} />
      <LandingHeaderBar
        primaryNavLabel={t.landing.primaryNav}
        brand={t.landing.brand}
        brandHref="#home"
        languageToggleLabel={t.landing.languageToggle}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        navItems={navItems}
        action={{ label: t.landing.joinUs, href: "#partners" }}
      />

      <main id="main-content" className="pt-20" tabIndex={-1}>
        <section
          id="home"
          className="scroll-mt-24 overflow-hidden px-5 py-20 md:px-8"
        >
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div className="relative">
              <h1 className="mb-6 text-5xl leading-tight font-bold lg:text-7xl">
                {t.landing.heroTitleLead} <br className="hidden lg:block" />
                <span className="text-primary italic">
                  {t.landing.heroTitleHighlight}
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-lg text-text-muted">
                {t.landing.heroDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setLocation("/register")}
                  className="gold-button rounded-lg px-8 py-4 font-semibold focus-ring bg-none border-none cursor-pointer"
                >
                  {t.landing.heroJoin}
                </button>
                <a
                  href="/?name="
                  target="_blank"
                  className="rounded-lg border border-primary-25 px-8 py-4 font-semibold text-primary transition-colors hover:bg-primary-10 focus-ring bg-none cursor-pointer"
                >
                  {t.landing.liveDemo}
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-outline-variant shadow-[0_0_30px_rgba(233,193,118,0.15)]">
                <img
                  src="/screenshot.png"
                  alt={t.landing.heroImageAlt}
                  className="block h-auto w-full"
                />
              </div>

            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-y border-outline-variant bg-surface/30 px-5 py-20 md:px-8"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="eyebrow-label mb-2">{t.landing.perspective}</span>
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
                  className="flat-card ghost-border rounded-2xl p-8 text-center"
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
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="eyebrow-label mb-2">{t.landing.capabilities}</span>
              <h2 className="text-4xl font-bold lg:text-5xl">
                {t.landing.premiumFeatures}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featureItems.map((item) => (
                <article
                  key={item.title}
                  className="flat-card ghost-border rounded-2xl p-8 text-center"
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

        <section
          id="partners"
          className="scroll-mt-24 border-t border-outline-variant bg-surface-container px-5 py-20 md:px-8"
        >
          <div className="mx-auto mb-12 w-full max-w-3xl text-center">
            <span className="eyebrow-label mb-2">{t.landing.ecosystem}</span>
            <h2 className="text-3xl font-bold md:text-4xl">
              {t.landing.partnersHeading}
            </h2>
            <p className="mt-3 text-lg text-text-muted">
              {t.landing.partnersSubheading}
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
            <PartnerCard
              icon="mosque"
              eyebrow={t.landing.forCommunities}
              title={t.landing.mosque}
              description={t.landing.mosqueDescription}
              benefits={t.landing.mosqueBenefits}
              action={{
                label: t.landing.registerMosque,
                onClick: () => setLocation("/register"),
              }}
            />

            <PartnerCard
              icon="handshake"
              eyebrow={t.landing.forPartners}
              title={t.landing.businessPartner}
              description={t.landing.businessDescription}
              benefits={t.landing.businessBenefits}
              action={{
                label: t.landing.contactSales,
                href: "mailto:divine-display@snake.mozmail.com?subject=Divine%20Display%20Partnership%20Inquiry",
              }}
            />
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className="scroll-mt-24 border-t border-outline-variant bg-background-deep px-5 pt-20 pb-20 md:px-8"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-2xl font-semibold text-primary">
              {t.landing.brand}
            </p>
            <p className="text-text-muted">{t.landing.footerDescription}</p>
          </div>

          {/*
          <div>
            <p className="eyebrow-label mb-4">{t.landing.legal}</p>
            <a
              href="/LICENSE"
              download
              className="block text-text-muted transition-colors hover:text-primary focus-ring"
            >
              {t.landing.license}
            </a>
          </div>
          */}

          <div className="md:justify-self-end">
            <p className="eyebrow-label mb-4">{t.landing.contact}</p>

            <div className="flex flex-col gap-3">
              <a
                href="https://github.com/As-Salam-Mosque/divine-display"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                className="inline-flex items-center gap-2 text-text-muted transition-colors hover:text-primary focus-ring"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.596 2 12.267c0 4.537 2.865 8.387 6.839 9.745.5.094.682-.222.682-.493 0-.244-.009-.89-.014-1.747-2.782.617-3.37-1.389-3.37-1.389-.454-1.19-1.11-1.507-1.11-1.507-.908-.637.069-.624.069-.624 1.004.072 1.532 1.057 1.532 1.057.892 1.566 2.341 1.114 2.91.852.091-.666.35-1.114.636-1.37-2.22-.26-4.555-1.14-4.555-5.07 0-1.12.39-2.036 1.029-2.754-.103-.261-.446-1.31.098-2.73 0 0 .84-.275 2.75 1.052A9.36 9.36 0 0 1 12 6.84a9.36 9.36 0 0 1 2.504.35c1.909-1.327 2.748-1.052 2.748-1.052.546 1.42.203 2.469.1 2.73.64.718 1.027 1.634 1.027 2.754 0 3.94-2.338 4.807-4.566 5.062.359.318.678.946.678 1.907 0 1.376-.012 2.485-.012 2.823 0 .273.18.592.688.492C19.138 20.65 22 16.802 22 12.267 22 6.596 17.523 2 12 2Z" />
                </svg>
                <span>Divine Display</span>
              </a>

              <a
                href="mailto:divine-display@snake.mozmail.com"
                aria-label="Email divine-display"
                className="inline-flex items-center gap-2 text-text-muted transition-colors hover:text-primary focus-ring"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  mail
                </span>
                <span>divine-display@snake.mozmail.com</span>
              </a>

              <a
                href="https://github.com/As-Salam-Mosque/divine-display/issues"
                target="_blank"
                rel="noreferrer"
                aria-label="Report issues"
                className="inline-flex items-center gap-2 text-text-muted transition-colors hover:text-primary focus-ring"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  bug_report
                </span>
                <span>Report an issue</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
