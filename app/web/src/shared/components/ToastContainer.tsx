import { useEffect } from "react";
import { useToastStore, type ToastVariant } from "@/shared/store/toastStore";
import { CloseIcon } from "@/features/calendar/components/icons";

const AUTO_DISMISS_MS = 4000;

const variantStyles: Record<ToastVariant, string> = {
  warning: "bg-white border-amber-500 text-amber-700",
  error: "bg-white border-red-300 text-red-700",
};

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  message,
  variant,
  onDismiss,
}: {
  id: string;
  message: string;
  variant: ToastVariant;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm ${variantStyles[variant]}`}
    >
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="shrink-0 text-slate-500 hover:text-slate-700"
      >
        <span className="sr-only">Dismiss</span>
        <CloseIcon />
      </button>
    </div>
  );
}
