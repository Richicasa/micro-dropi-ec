"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function showToast(message: string, type: "success" | "error" | "info" = "success") {
  if (typeof window === "undefined") return;
  const event = new CustomEvent("microdropi_toast", {
    detail: { id: Math.random().toString(), message, type }
  });
  window.dispatchEvent(event);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      const newToast = customEvent.detail;
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3500);
    };

    window.addEventListener("microdropi_toast", handler);
    return () => window.removeEventListener("microdropi_toast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 px-4 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border p-3 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "border-emerald-500/40 bg-neutral-950/95 text-emerald-300"
              : toast.type === "error"
              ? "border-rose-500/40 bg-neutral-950/95 text-rose-300"
              : "border-blue-500/40 bg-neutral-950/95 text-blue-300"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
          {toast.type === "info" && <Info className="h-5 w-5 text-blue-400 shrink-0" />}
          
          <span className="text-xs font-medium leading-snug flex-1">{toast.message}</span>

          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-neutral-500 hover:text-white p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
