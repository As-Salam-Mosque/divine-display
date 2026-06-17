const navItems = ["Home", "About Us", "Features", "Partners", "Contact"];

const visionItems = [
  {
    icon: "verified_user",
    title: "Halal Screened",
    description:
      "Only community businesses that align with Islamic values are permitted to display announcements.",
  },
  {
    icon: "groups",
    title: "Community Driven",
    description:
      "Local businesses support their spiritual home while growing their reach within the community.",
  },
  {
    icon: "public",
    title: "Freedom",
    description:
      "The clock is open source and can be installed anywhere for free for accessible digital infrastructure.",
  },
];

const featureItems = [
  {
    icon: "schedule",
    title: "Real-time prayer times",
    description:
      "Automated, location-based Adhan and Iqamah times with multiple calculation methods.",
  },
  {
    icon: "campaign",
    title: "Community announcements",
    description:
      "Broadcast Jumu'ah times, educational events, and community alerts instantly.",
  },
  {
    icon: "art_track",
    title: "Display custom posters",
    description:
      "Upload your own graphics and PDF posters to rotate seamlessly on the display.",
  },
  {
    icon: "trending_up",
    title: "Dynamic promotions",
    description:
      "Showcase partner businesses and fundraising goals with elegant visuals.",
  },
  {
    icon: "devices",
    title: "Beautiful on all devices",
    description:
      "Optimized for TV displays, tablets, mobile phones, and desktop browsers.",
  },
  {
    icon: "auto_awesome",
    title: "Continuous updates",
    description:
      "New features and religious content are continuously shipped at no extra cost.",
  },
];

export function LandingPage() {
  return (
    <div className="dark min-h-screen bg-background-deep text-on-surface font-body-md">
      <nav className="fixed top-0 z-50 w-full border-b border-outline-variant bg-background-deep/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-8">
          <span className="font-headline-md text-2xl font-bold text-primary">
            Divine Display
          </span>
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="font-label-caps text-sm tracking-wide text-text-muted transition-colors hover:text-primary"
              >
                {item}
              </a>
            ))}
          </div>
          <button className="gold-button rounded-lg px-6 py-2 text-sm font-semibold">
            Join Us
          </button>
        </div>
      </nav>

      <main className="pt-20">
        <section className="overflow-hidden px-5 py-24 md:px-8">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="mb-6 text-5xl leading-tight font-bold lg:text-7xl">
                Elevate Your <br />
                <span className="text-primary italic">
                  Masjid&apos;s Presence.
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-lg text-text-muted">
                Providing sacred spaces with the digital tools they need to
                connect, inform and grow.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="gold-button rounded-lg px-8 py-4 font-semibold">
                  Join us
                </button>
                <button className="rounded-lg border border-primary-25 px-8 py-4 font-semibold text-primary transition-colors hover:bg-primary-10">
                  Live demo
                </button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-2xl border border-outline-variant shadow-[0_0_30px_rgba(233,193,118,0.15)]">
                <img
                  src="/screenshot.png"
                  alt="Divine Display interface screenshot"
                  className="block h-auto w-full"
                />
              </div>
              <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
              <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-surface-panel blur-[80px]" />
            </div>
          </div>
        </section>

        <section className="border-y border-outline-variant bg-surface/30 px-5 py-20 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-2 block text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                Perspective
              </span>
              <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
                Our Vision
              </h2>
              <p className="text-lg text-text-muted">
                Redefining how masjids connect with congregants through ethical,
                community-centric technology.
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

        <section className="px-5 py-20 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <span className="mb-2 block text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                  Capabilities
                </span>
                <h2 className="text-4xl font-bold lg:text-5xl">
                  Premium Features
                </h2>
              </div>
              <p className="max-w-sm text-lg text-text-muted">
                Everything needed to manage your mosque&apos;s digital presence
                in one elegant dashboard.
              </p>
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

        <section className="bg-surface-container px-5 py-20 md:px-8">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
            <article className="ghost-border rounded-2xl bg-surface-panel p-8">
              <span className="mb-2 block text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                For Communities
              </span>
              <h2 className="mb-4 text-4xl font-bold">Mosque</h2>
              <p className="mb-7 text-lg text-text-muted">
                Upgrade your facility with a premium digital display system. No
                hardware costs, no subscription fees.
              </p>
              <button className="gold-button rounded-lg px-8 py-4 font-semibold">
                Register your mosque for free
              </button>
            </article>

            <article className="ghost-border rounded-2xl bg-surface-panel p-8">
              <span className="mb-2 block text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                For Partners
              </span>
              <h2 className="mb-4 text-4xl font-bold">Business (Partner)</h2>
              <p className="mb-7 text-lg text-text-muted">
                Increase your reach while supporting your local mosque through a
                halal-screened announcement network.
              </p>
              <button className="gold-button rounded-lg px-8 py-4 font-semibold">
                Contact our sales representative
              </button>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant bg-background-deep px-5 py-16 md:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <p className="mb-4 text-2xl font-semibold text-primary">
              Divine Display
            </p>
            <p className="text-text-muted">
              Providing sacred spaces with digital tools to connect, inform and
              grow.
            </p>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              Company
            </p>
            <p className="text-text-muted">About Us</p>
            <p className="mt-2 text-text-muted">Features</p>
            <p className="mt-2 text-text-muted">Sitemap</p>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              Legal
            </p>
            <p className="text-text-muted">Privacy Policy</p>
            <p className="mt-2 text-text-muted">Terms of Service</p>
            <p className="mt-2 text-text-muted">Ad Policy</p>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              Contact
            </p>
            <p className="text-text-muted">salam@divinedisplay.ca</p>
            <p className="mt-2 text-text-muted">+1 (416) 555-0128</p>
            <p className="mt-2 text-text-muted">Toronto, ON, Canada</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
