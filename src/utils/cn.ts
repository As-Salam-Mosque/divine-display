/**
 * Joins class name fragments, filtering out falsy values.
 * Lightweight alternative to `clsx` with no external dependency.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
