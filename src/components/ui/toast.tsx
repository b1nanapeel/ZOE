"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void | Promise<void> };
  duration: number;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: { label: string; onClick: () => void | Promise<void> };
  duration?: number;
}

interface ToastContextValue {
  toast: (t: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const t: Toast = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? "success",
      action: input.action,
      duration: input.duration ?? 4500,
    };
    setToasts((curr) => [...curr, t]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  dismiss,
}: {
  toast: Toast;
  dismiss: (id: string) => void;
}) {
  useEffect(() => {
    const handle = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(handle);
  }, [toast, dismiss]);

  const Icon =
    toast.variant === "error"
      ? AlertCircle
      : toast.variant === "info"
        ? AlertCircle
        : CheckCircle2;

  const tone =
    toast.variant === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : toast.variant === "info"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-primary-50 text-primary-700 border-primary-200";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-3 shadow-md",
        tone,
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-neutral-600">
            {toast.description}
          </p>
        )}
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={async () => {
            await toast.action!.onClick();
            dismiss(toast.id);
          }}
          className="text-sm font-semibold text-primary-700 hover:underline"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="text-neutral-400 hover:text-neutral-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
