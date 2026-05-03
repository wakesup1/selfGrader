import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeOutput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const STATUS_BADGE: Record<string, string> = {
  AC:  "border-emerald-200 bg-emerald-50 text-emerald-700",
  WA:  "border-red-200     bg-red-50     text-red-700",
  TLE: "border-amber-200   bg-amber-50   text-amber-700",
  CE:  "border-purple-200  bg-purple-50  text-purple-700",
  RE:  "border-orange-200  bg-orange-50  text-orange-700",
};

export function statusBadgeClass(status: string): string {
  return STATUS_BADGE[status] ?? "border-stone-200 bg-stone-100 text-stone-600";
}

export const STATUS_LABEL: Record<string, string> = {
  AC:             "Brewed",
  WA:             "Burnt",
  TLE:            "Timed Out",
  CE:             "Compile Error",
  RE:             "Crashed",
  ERR:            "Error",
  GRADER_OFFLINE: "Grader Offline",
  JUDGE0_OFFLINE: "Grader Offline",
};
