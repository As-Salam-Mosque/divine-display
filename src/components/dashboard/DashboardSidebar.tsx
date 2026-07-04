import { cn } from "../../utils/cn";
import type { DashboardTranslations } from "./types";

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  t: DashboardTranslations;
}

export function DashboardSidebar({
  activeSection,
  onSectionChange,
  t,
}: DashboardSidebarProps) {
  return (
    <aside
      className="hidden lg:block w-48 shrink-0 fixed top-0 left-0 h-full z-40 bg-background-deep"
      style={{ borderRight: "1px solid var(--ghost-border-color)" }}
    >
      <nav
        className="sticky space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto mt-20 mb-8 px-3"
        style={{ top: "5.5rem" }}
        aria-label="Configuration sections"
      >
        {[
          {
            id: "mosque-info",
            icon: "mosque",
            label: t.mosqueInformation,
          },
          {
            id: "location",
            icon: "location_on",
            label: "Location & Calculation",
          },
          {
            id: "iqamah",
            icon: "schedule",
            label: t.iqamahOffsets,
          },
          {
            id: "announcements",
            icon: "campaign",
            label: t.announcements,
          },
          {
            id: "sponsors",
            icon: "storefront",
            label: t.sponsors,
          },
          {
            id: "ad-rail-slots",
            icon: "view_column",
            label: t.adRailSlots,
          },
          { id: "promo", icon: "timer", label: t.promoTiming },
          {
            id: "extra-prayers",
            icon: "add_circle",
            label: t.extraPrayers,
          },
        ].map(({ id, icon, label }) => {
          const isActive = activeSection === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                const section = document.getElementById(id);
                if (!section) return;
                const top = section.offsetTop - 112;
                window.history.replaceState(null, "", `#${id}`);
                window.scrollTo({
                  top: Math.max(0, top),
                  behavior: "smooth",
                });
                onSectionChange(id);
              }}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors focus-ring",
                isActive
                  ? "text-primary bg-primary/10 font-medium"
                  : "text-text-muted hover:text-primary hover:bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined shrink-0",
                  isActive && "filled",
                )}
                style={{ fontSize: 18 }}
                aria-hidden="true"
              >
                {icon}
              </span>
              <span>{label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
