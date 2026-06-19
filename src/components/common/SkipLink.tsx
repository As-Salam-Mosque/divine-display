import { cn } from "../../utils/cn";

interface SkipLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function SkipLink({ href, label, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-black focus:rounded-lg focus:font-semibold",
        className,
      )}
    >
      {label}
    </a>
  );
}
