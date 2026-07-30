interface PartnerCardProps {
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  action: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function PartnerCard({
  icon,
  eyebrow,
  title,
  description,
  benefits,
  action,
}: PartnerCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-primary-25 bg-linear-to-br from-surface-panel to-surface-container p-8 shadow-lg shadow-black/20">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary-25 bg-background-deep">
          <span
            className="material-symbols-outlined text-3xl text-primary"
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>
        <div className="min-w-0">
          <span className="eyebrow-label mb-1">{eyebrow}</span>
          <h3 className="text-3xl font-bold md:text-4xl">{title}</h3>
        </div>
      </div>
      <p className="mb-5 text-lg text-text-muted">{description}</p>
      <ul className="mb-8 space-y-3 text-text-muted">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3">
            <span
              className="material-symbols-outlined mt-0.5 text-xl text-primary"
              aria-hidden="true"
            >
              check_circle
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      {action.onClick ? (
        <button
          type="button"
          onClick={action.onClick}
          className="gold-button mt-auto block w-full rounded-lg border-none bg-none px-8 py-4 text-center font-semibold focus-ring cursor-pointer"
        >
          {action.label}
        </button>
      ) : (
        <a
          href={action.href}
          className="gold-button mt-auto block w-full rounded-lg px-8 py-4 text-center font-semibold focus-ring"
        >
          {action.label}
        </a>
      )}
    </article>
  );
}
