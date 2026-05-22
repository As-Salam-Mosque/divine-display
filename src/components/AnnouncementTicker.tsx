import { useT } from "../i18n";
import { useSettings } from "../context/SettingsContext";

export function AnnouncementTicker() {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const announcements =
    settings.language === "fr"
      ? settings.mosque.announcements_fr
      : settings.mosque.announcements_en;
  // Duplicate items so the marquee loops seamlessly
  const items = [...announcements, ...announcements];

  return (
    <footer className="w-full flex items-center px-4 md:px-6 lg:px-margin-page tv:px-[64px] h-12 sm:h-14 md:h-16 tv:h-20 border-t border-primary-20 bg-surface-panel overflow-hidden shrink-0">
      {/* Label */}
      <div className="flex items-center gap-3 lg:gap-4 bg-surface-panel z-10 pr-3 lg:pr-4 border-r border-primary-20 h-full shrink-0">
        <span className="material-symbols-outlined text-primary text-lg lg:text-xl tv:text-2xl">
          view_list
        </span>
        <span className="font-label-caps font-bold text-[10px] md:text-xs lg:text-label-caps tv:text-base text-primary whitespace-nowrap">
          {t.masjidAnnouncements}
        </span>
      </div>

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden ml-4">
        <div className="flex items-center h-full gap-6 md:gap-8 lg:gap-12 font-body-md text-sm md:text-base lg:text-[18px] tv:text-[24px] leading-tight text-text-muted whitespace-nowrap animate-marquee">
          {items.map((text, i) => (
            <p
              key={i}
              dangerouslySetInnerHTML={{ __html: formatAnnouncement(text) }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}

/** Bold the part before " — " if present */
function formatAnnouncement(text: string): string {
  const dashIndex = text.indexOf(" — ");
  if (dashIndex === -1) return text;
  const title = text.slice(0, dashIndex);
  const rest = text.slice(dashIndex);
  return `<span class="text-on-surface font-semibold">${title}</span>${rest}`;
}
