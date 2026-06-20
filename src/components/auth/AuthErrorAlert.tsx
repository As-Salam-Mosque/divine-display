interface AuthErrorAlertProps {
  message: string;
}

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-6 p-4 rounded-lg bg-surface-container border border-primary/20 text-primary text-sm"
    >
      {message}
    </div>
  );
}
