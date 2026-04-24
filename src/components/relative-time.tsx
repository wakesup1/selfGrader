"use client";

/**
 * RelativeTime
 *
 * Renders a stable absolute date during SSR/initial hydration, then upgrades
 * to a "time ago" string on the client after mount.
 *
 * This prevents the most common Next.js hydration error: formatDistanceToNow
 * produces one string on the server (e.g. "5 minutes ago") and a slightly
 * different string on the client a moment later ("6 minutes ago"), causing
 * React to throw a hydration mismatch.
 */

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

function toAbsolute(iso: string): string {
  // Explicit locale + UTC timezone → always produces the identical string on
  // both server and client regardless of system locale or TZ settings.
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RelativeTime({ date }: { date: string }) {
  // Start with the stable absolute string (same on server + client = no mismatch).
  const [label, setLabel] = useState(() => toAbsolute(date));

  useEffect(() => {
    // Upgrade to relative time after hydration — client only.
    setLabel(formatDistanceToNow(new Date(date), { addSuffix: true }));
  }, [date]);

  return (
    <time dateTime={date} title={toAbsolute(date)}>
      {label}
    </time>
  );
}
