import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getDeadlineInfo(deadlineString: string | Date) {
  const now = new Date().getTime();
  const deadline = new Date(deadlineString).getTime();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffTime < 0) {
    return {
      isExpired: true,
      isUrgent: false,
      text: "Muddat o'tgan",
      daysLeft: 0,
    };
  }

  if (diffDays <= 7) {
    return {
      isExpired: false,
      isUrgent: true,
      text: `${diffDays} kun qoldi`,
      daysLeft: diffDays,
    };
  }

  return {
    isExpired: false,
    isUrgent: false,
    text: `${diffDays} kun qoldi`,
    daysLeft: diffDays,
  };
}
