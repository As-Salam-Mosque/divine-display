import { useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { useDebugPromo } from "../hooks/useDebugPromo";
import { useDominantColor } from "../hooks/useDominantColor";
import { usePromoTimer } from "../hooks/usePromoTimer";
import { cn } from "../utils/cn";

interface PromoRailProps {
  isCriticalSignal: boolean;
  onActiveChange?: (active: boolean) => void;
}

export function PromoRail({
  isCriticalSignal,
  onActiveChange,
}: PromoRailProps) {
  const { settings } = useSettings();

  const debugPromo = useDebugPromo();
  const { phase, currentSlot } = usePromoTimer({
    slots: settings.mosque?.sponsors ?? [],
    promoConfig: settings.mosque?.promo,
    enabled: settings.showSponsors,
    forceVisible: debugPromo,
  });

  const promoImage = currentSlot?.image ?? null;
  const promoAlt = currentSlot?.label ?? "";
  // Only "active" once the promo is actually transitioning into view.
  const isActive =
    !isCriticalSignal &&
    settings.showSponsors &&
    !!promoImage &&
    (debugPromo || phase === "visible");

  // Notify parent when promo active state changes so layout can adapt
  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  const slideState = isActive
    ? "translate-x-0 opacity-100"
    : "translate-x-full opacity-0";

  const showRail = !isCriticalSignal && settings.showSponsors && promoImage;

  const {
    imgRef: promoImgRef,
    bgCss: promoBgCss,
    handleImageLoad: handlePromoImageLoad,
  } = useDominantColor();

  if (!showRail) return null;

  return (
    <aside
      className={cn(
        "hidden md:block md:absolute md:top-0 md:right-0 md:w-(--promo-rail-width) pl-1 md:pl-2 md:h-full z-10 transform transition-all duration-500 ease-out",
        slideState,
      )}
      aria-label={promoAlt || undefined}
      aria-hidden={!promoAlt}
    >
      <div
        className={cn(
          "w-full h-full rounded-xl overflow-hidden flex items-center justify-center shadow-inner",
          !promoBgCss &&
            "bg-linear-to-tr from-[rgba(var(--primary-rgb),0.2)] to-[rgba(var(--primary-rgb),0.1)]",
        )}
        style={promoBgCss ? { backgroundColor: promoBgCss } : undefined}
      >
        {currentSlot?.link && promoAlt ? (
          <a
            href={currentSlot.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full block rounded-xl focus-ring"
          >
            <img
              ref={promoImgRef}
              src={promoImage}
              alt={promoAlt}
              className="object-contain w-full h-full aspect-16-9"
              onLoad={handlePromoImageLoad}
              crossOrigin="anonymous"
              decoding="async"
              loading="lazy"
            />
          </a>
        ) : (
          <img
            ref={promoImgRef}
            src={promoImage}
            alt={promoAlt || ""}
            className="object-contain w-full h-full aspect-16-9"
            onLoad={handlePromoImageLoad}
            crossOrigin="anonymous"
            decoding="async"
            loading="lazy"
          />
        )}
      </div>
    </aside>
  );
}
