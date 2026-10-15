import React from "react";
import { Loader2, FolderOpen, AlertTriangle } from "lucide-react";

export function LoadingState({ message = "Ma'lumotlar yuklanmoqda..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className="w-8 h-8 text-teal animate-spin mb-3" />
      <p className="text-sm text-muted-text font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = "Ma'lumot topilmadi",
  description = "Hozircha bu bo'limda hech qanday ma'lumot mavjud emas.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-black/5 p-8">
      <div className="w-12 h-12 rounded-full bg-mist flex items-center justify-center text-teal mb-3">
        <FolderOpen className="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 className="font-heading font-bold text-base text-ink mb-1">{title}</h3>
      <p className="text-sm text-muted-text max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  message = "Ma'lumotlarni yuklashda xatolik yuz berdi.",
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-danger-soft/50 rounded-2xl border border-danger-text/20 p-8">
      <div className="w-12 h-12 rounded-full bg-danger-soft flex items-center justify-center text-danger-text mb-3">
        <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 className="font-heading font-bold text-base text-danger-text mb-1">Xatolik yuz berdi</h3>
      <p className="text-sm text-muted-text max-w-sm mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-5 py-2 rounded-full bg-teal text-white text-xs font-semibold hover:bg-teal-hover transition-colors"
        >
          Qaytadan urinish
        </button>
      )}
    </div>
  );
}

export function CountdownBadge({ deadline }: { deadline: string }) {
  const now = new Date().getTime();
  const d = new Date(deadline).getTime();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

  if (d < now) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-soft text-danger-text">
        Muddat o&apos;tgan
      </span>
    );
  }

  if (diffDays <= 7) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-soft text-danger-text animate-pulse">
        ⏳ {diffDays} kun qoldi
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-mist text-muted-text">
      ⏳ {diffDays} kun qoldi
    </span>
  );
}

export function DemoBadge() {
  return null;
}


export function StarDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none opacity-15 text-white ${className}`}
      width="120"
      height="120"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M50 0 L62 38 L100 50 L62 62 L50 100 L38 62 L0 50 L38 38 Z" />
      <circle cx="50" cy="50" r="16" />
    </svg>
  );
}
