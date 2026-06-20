import { cn } from "../../utils/cn";

interface AuthSubmitButtonProps {
  loading: boolean;
  loadingLabel: string;
  idleLabel: string;
}

export function AuthSubmitButton({
  loading,
  loadingLabel,
  idleLabel,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "w-full gold-button rounded-lg py-4 font-bold font-body-md",
        "flex items-center justify-center gap-2",
        "hover:brightness-110 active:scale-[0.98] transition-all duration-200",
        "shadow-lg",
        loading && "opacity-70 cursor-not-allowed",
      )}
      style={{ boxShadow: "0 4px 24px rgba(233,193,118,0.10)" }}
    >
      {loading ? (
        <>
          <span
            className="material-symbols-outlined motion-safe:animate-spin"
            style={{ fontSize: 20 }}
            aria-hidden="true"
          >
            sync
          </span>
          {loadingLabel}
        </>
      ) : (
        idleLabel
      )}
    </button>
  );
}
