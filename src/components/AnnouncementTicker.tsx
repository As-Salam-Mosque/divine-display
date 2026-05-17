interface AnnouncementTickerProps {
  announcements: string[];
}

import { useT } from "../i18n";
import { useSettings } from "../context/SettingsContext";

export function AnnouncementTicker({ announcements }: AnnouncementTickerProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);
  // Duplicate items so the marquee loops seamlessly
  const items = [...announcements, ...announcements];

  return (
    <footer className="w-full flex items-center px-margin-page h-16 border-t border-primary/20 bg-surface-panel overflow-hidden shrink-0">
      {/* Label */}
      <div className="flex items-center gap-4 bg-surface-panel z-10 pr-4 border-r border-primary/20 h-full shrink-0">
        <span className="material-symbols-outlined text-primary">
          view_list
        </span>
        <span className="font-label-caps text-label-caps text-primary whitespace-nowrap">
          {t.masjidAnnouncements}
        </span>
      </div>

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden ml-4">
        <div className="flex gap-12 font-body-md text-body-md text-text-muted whitespace-nowrap animate-marquee">
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
