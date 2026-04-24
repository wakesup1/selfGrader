// nograder — Icon Library
// All icons: 24×24 viewBox, 1.5 stroke, currentColor, rounded caps/joins.
// Cafe metaphor: problems = menu, submissions = receipts, verdicts = brew states,
// difficulty = roast level, topics = pantry items, hall of fame = mug trophies.

import React from "react";

interface IconProps {
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
  fill?: string;
}

function NGIcon({
  size = 18,
  strokeWidth = 1.5,
  fill = "none",
  style,
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ========================================================== */
/* NAV                                                         */
/* ========================================================== */

// Dashboard — cafe storefront awning
export function IconDashboard(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M3 10 L12 4 L21 10" />
      <path d="M5 10 v10 h14 v-10" />
      <path d="M5 10 h14" />
      <path d="M9 20 v-5 h6 v5" />
    </NGIcon>
  );
}

// Problems — menu card with lines
export function IconMenu(p: IconProps) {
  return (
    <NGIcon {...p}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 7 h8" />
      <path d="M8 11 h8" />
      <path d="M8 15 h5" />
      <circle cx="16.5" cy="15" r="0.8" fill="currentColor" stroke="none" />
    </NGIcon>
  );
}

// Submissions — receipt with tear-edge bottom
export function IconReceipt(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M6 3 h12 v16 l-2 -1.2 l-2 1.2 l-2 -1.2 l-2 1.2 l-2 -1.2 l-2 1.2 z" />
      <path d="M9 8 h6" />
      <path d="M9 11 h6" />
      <path d="M9 14 h4" />
    </NGIcon>
  );
}

// Hall of Fame — trophy shaped like a mug with handle
export function IconTrophyMug(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M7 4 h9 v7 a4.5 4.5 0 0 1 -4.5 4.5 h0 a4.5 4.5 0 0 1 -4.5 -4.5 z" />
      <path d="M16 6 a2.5 2.5 0 0 1 0 5" />
      <path d="M9 15.5 v2" />
      <path d="M14 15.5 v2" />
      <path d="M6 19 h12" />
    </NGIcon>
  );
}

// Post Problem — fountain pen nib
export function IconPen(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M15.5 4.5 l4 4 l-10.5 10.5 l-5 1 l1 -5 z" />
      <path d="M13.5 6.5 l4 4" />
      <path d="M9 14 l1 1" />
    </NGIcon>
  );
}

// Statistics — bar + trend line
export function IconChart(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 20 h16" />
      <path d="M7 20 v-6" />
      <path d="M11 20 v-10" />
      <path d="M15 20 v-4" />
      <path d="M19 20 v-8" />
      <path d="M4 10 L8.5 6 L13 9 L20 4" strokeDasharray="2 2" opacity={0.55} />
    </NGIcon>
  );
}

/* ========================================================== */
/* BRAND / SIGNATURE                                           */
/* ========================================================== */

// Coffee bean with groove
export function IconBean(p: IconProps) {
  return (
    <NGIcon {...p}>
      <ellipse cx="12" cy="12" rx="5.5" ry="8.5" transform="rotate(-28 12 12)" />
      <path d="M9 5.5 C 11.5 9, 12.5 15, 15 18.5" transform="rotate(-28 12 12)" />
    </NGIcon>
  );
}

// Steaming cup — brand glyph
export function IconCup(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 10 h13 v5 a4 4 0 0 1 -4 4 h-5 a4 4 0 0 1 -4 -4 z" />
      <path d="M17 11.5 a2.5 2.5 0 0 1 0 5" />
      <path d="M8 7 c -0.5 -1, 0.5 -2, 0 -3" opacity={0.7} />
      <path d="M12 7 c -0.5 -1, 0.5 -2, 0 -3" opacity={0.7} />
    </NGIcon>
  );
}

// Kettle (brew-in-progress)
export function IconKettle(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 11 h13 l-1.5 7 a2 2 0 0 1 -2 1.5 h-6 a2 2 0 0 1 -2 -1.5 z" />
      <path d="M17 12.5 l3 -2" />
      <path d="M8 8 h5" />
      <path d="M10.5 8 v3" />
      <path d="M10 5 c -0.5 -1, 0.5 -1.5, 0 -2.5" opacity={0.65} />
    </NGIcon>
  );
}

/* ========================================================== */
/* VERDICTS — brew states                                     */
/* ========================================================== */

// Brewed (Accepted) — check in circle
export function IconBrewed(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 12.2 l3.2 3.2 l6 -6.6" />
    </NGIcon>
  );
}

// Steeping (Pending) — hourglass
export function IconSteeping(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M7 3 h10" />
      <path d="M7 21 h10" />
      <path d="M7 3 v3 c 0 2, 5 3, 5 6 c 0 3, -5 4, -5 6 v3" />
      <path d="M17 3 v3 c 0 2, -5 3, -5 6 c 0 3, 5 4, 5 6 v3" />
    </NGIcon>
  );
}

// Burnt (Wrong Answer) — flame
export function IconBurnt(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M12 3 c 2 3, 4.5 4.5, 4.5 8 a 4.5 4.5 0 0 1 -9 0 c 0 -2 1.5 -3 2.5 -4.5 c 1 1.5, 2 2, 2 3.5" />
      <path d="M9 18.5 h6" />
      <path d="M10 21 h4" opacity={0.6} />
    </NGIcon>
  );
}

// Spilled (Runtime Error) — tipped cup with drips
export function IconSpilled(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M3 10 l11 -4 l1.5 4 l-4 4 l-2 5 l-4 -1 z" />
      <path d="M15 15 v2" />
      <path d="M18 16 v2.5" />
      <path d="M16.5 19 v2" />
    </NGIcon>
  );
}

// Timeout — stopwatch
export function IconTimeout(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M10 3 h4" />
      <path d="M12 3 v2" />
      <path d="M12 13.5 v-4" />
      <path d="M12 13.5 l3 1.5" />
    </NGIcon>
  );
}

// Compile Error — broken chain
export function IconCompileErr(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 11 a4 4 0 0 1 4 -4 h2" />
      <path d="M20 13 a4 4 0 0 1 -4 4 h-2" />
      <path d="M10 15 l4 -6" strokeDasharray="1.5 2" opacity={0.8} />
      <path d="M11 7 l1.5 2 l-1.5 2" />
      <path d="M13 17 l -1.5 -2 l 1.5 -2" />
    </NGIcon>
  );
}

/* ========================================================== */
/* DIFFICULTY — roast levels                                   */
/* ========================================================== */

// Light roast (Easy)
export function IconRoastLight(p: IconProps) {
  return (
    <NGIcon {...p}>
      <ellipse cx="12" cy="12" rx="4" ry="6" transform="rotate(-25 12 12)" />
      <path d="M10 8.5 C 12 11, 12.5 14, 14 16.5" transform="rotate(-25 12 12)" />
    </NGIcon>
  );
}

// Medium roast (Medium) — 2 beans
export function IconRoastMedium(p: IconProps) {
  return (
    <NGIcon {...p}>
      <ellipse cx="9" cy="13" rx="3.2" ry="5" transform="rotate(-25 9 13)" />
      <path d="M7.5 10 C 9 12, 9.5 14.5, 10.5 16" transform="rotate(-25 9 13)" />
      <ellipse cx="15" cy="11" rx="3.2" ry="5" transform="rotate(-25 15 11)" />
      <path d="M13.5 8 C 15 10, 15.5 12.5, 16.5 14" transform="rotate(-25 15 11)" />
    </NGIcon>
  );
}

// Dark roast (Hard) — 3 beans
export function IconRoastDark(p: IconProps) {
  return (
    <NGIcon {...p}>
      <ellipse cx="6.5" cy="14" rx="2.6" ry="4" transform="rotate(-25 6.5 14)" />
      <ellipse cx="12" cy="10" rx="2.6" ry="4" transform="rotate(-25 12 10)" />
      <ellipse cx="17.5" cy="14" rx="2.6" ry="4" transform="rotate(-25 17.5 14)" />
    </NGIcon>
  );
}

// Espresso (Expert)
export function IconEspresso(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M7 13 h9 v3 a3 3 0 0 1 -3 3 h-3 a3 3 0 0 1 -3 -3 z" />
      <path d="M16 14.5 a1.5 1.5 0 0 1 0 3" />
      <path d="M10 10 c -0.5 -1, 0.5 -2, 0 -3.5" />
      <path d="M13.5 10 c -0.5 -1, 0.5 -2, 0 -3.5" />
    </NGIcon>
  );
}

/* ========================================================== */
/* TOPICS — pantry of algorithm topics                         */
/* ========================================================== */

// Array — stacked cards/trays
export function IconArray(p: IconProps) {
  return (
    <NGIcon {...p}>
      <rect x="3" y="9" width="3.5" height="6" rx="0.6" />
      <rect x="7.5" y="9" width="3.5" height="6" rx="0.6" />
      <rect x="12" y="9" width="3.5" height="6" rx="0.6" />
      <rect x="16.5" y="9" width="3.5" height="6" rx="0.6" />
    </NGIcon>
  );
}

// Graph — 3 nodes with edges
export function IconGraph(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M8 7 L16 7" />
      <path d="M7 8 L11 16" />
      <path d="M17 9 L13 16" />
    </NGIcon>
  );
}

// Tree — branching
export function IconTree(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="6.5" cy="13" r="1.8" />
      <circle cx="17.5" cy="13" r="1.8" />
      <circle cx="4" cy="20" r="1.5" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="15" cy="20" r="1.5" />
      <circle cx="20" cy="20" r="1.5" />
      <path d="M11 6.5 L7.5 11.5" />
      <path d="M13 6.5 L16.5 11.5" />
      <path d="M6 14.5 L4.5 18.5" />
      <path d="M7 14.5 L8.5 18.5" />
      <path d="M17 14.5 L15.5 18.5" />
      <path d="M18 14.5 L19.5 18.5" />
    </NGIcon>
  );
}

// DP — grid/table with arrows
export function IconDP(p: IconProps) {
  return (
    <NGIcon {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1" />
      <path d="M3.5 9 h17" />
      <path d="M3.5 14.5 h17" />
      <path d="M9 3.5 v17" />
      <path d="M14.5 3.5 v17" />
      <path d="M6 6 L12 12 L17 17" />
      <path d="M15.5 17 l1.5 0 l 0 -1.5" />
    </NGIcon>
  );
}

// Greedy — hand/pick
export function IconGreedy(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M5 13 v4 a3 3 0 0 0 3 3 h6 a4 4 0 0 0 4 -4 v-6 a1.5 1.5 0 0 0 -3 0 v2" />
      <path d="M15 11 v-5 a1.5 1.5 0 0 0 -3 0 v6" />
      <path d="M12 10 v-6 a1.5 1.5 0 0 0 -3 0 v8" />
      <path d="M9 11 v-5 a1.5 1.5 0 0 0 -3 0 v8" />
    </NGIcon>
  );
}

// String — quote marks
export function IconString(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M6 8 C 5 9, 5 11, 6 12 h2 v4 H4 v-4 C 4 10, 5 9, 6 7" />
      <path d="M14 8 C 13 9, 13 11, 14 12 h2 v4 h-4 v-4 C 12 10, 13 9, 14 7" />
    </NGIcon>
  );
}

// Math — pi with sum bar
export function IconMath(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 8 h16" />
      <path d="M9 8 v10 c 0 1, 0.5 1.5, 1.5 1.5" />
      <path d="M15 8 v11" />
      <path d="M5 18 l2 -2" opacity={0.75} />
      <path d="M18 17 l2 1" opacity={0.75} />
    </NGIcon>
  );
}

// Geometry — triangle + compass hint
export function IconGeometry(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M12 4 L21 20 L3 20 z" />
      <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
      <path d="M7 20 a5 5 0 0 1 10 0" opacity={0.55} strokeDasharray="2 2" />
    </NGIcon>
  );
}

// Sorting — bars ordered
export function IconSort(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M5 19 v-4" />
      <path d="M9 19 v-7" />
      <path d="M13 19 v-10" />
      <path d="M17 19 v-13" />
      <path d="M4 21 h16" />
    </NGIcon>
  );
}

// Search — spyglass
export function IconSearch(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16 l4.5 4.5" />
    </NGIcon>
  );
}

// Bitmask — binary bits
export function IconBits(p: IconProps) {
  return (
    <NGIcon {...p}>
      <rect x="3" y="7" width="3.5" height="10" rx="0.5" />
      <rect x="8" y="7" width="3.5" height="10" rx="0.5" />
      <rect x="13" y="7" width="3.5" height="10" rx="0.5" />
      <rect x="18" y="7" width="3" height="10" rx="0.5" />
      <text x="4.75" y="13.5" fontSize="5.5" fontFamily="monospace" stroke="none" fill="currentColor" textAnchor="middle">1</text>
      <text x="9.75" y="13.5" fontSize="5.5" fontFamily="monospace" stroke="none" fill="currentColor" textAnchor="middle">0</text>
      <text x="14.75" y="13.5" fontSize="5.5" fontFamily="monospace" stroke="none" fill="currentColor" textAnchor="middle">1</text>
      <text x="19.5" y="13.5" fontSize="5.5" fontFamily="monospace" stroke="none" fill="currentColor" textAnchor="middle">1</text>
    </NGIcon>
  );
}

/* ========================================================== */
/* ACTIONS                                                     */
/* ========================================================== */

// Submit (send/tray-to-counter)
export function IconSubmit(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 12 L20 4 L14 20 L12 13 z" />
      <path d="M12 13 L20 4" />
    </NGIcon>
  );
}

// Play (run code)
export function IconPlay(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M7 4 L19 12 L7 20 z" />
    </NGIcon>
  );
}

// Filter — funnel (coffee filter)
export function IconFilter(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 5 h16 l-6 8 v6 l-4 -2 v-4 z" />
    </NGIcon>
  );
}

// Bell
export function IconBell(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M6 8 a6 6 0 0 1 12 0 c 0 7, 3 9, 3 9 H 3 s 3 -2, 3 -9" />
      <path d="M10 21 a2 2 0 0 0 4 0" />
    </NGIcon>
  );
}

// Settings — gear (grinder setting)
export function IconGear(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3 v2.5" />
      <path d="M12 18.5 v2.5" />
      <path d="M3 12 h2.5" />
      <path d="M18.5 12 h2.5" />
      <path d="M5.6 5.6 l1.8 1.8" />
      <path d="M16.6 16.6 l1.8 1.8" />
      <path d="M5.6 18.4 l1.8 -1.8" />
      <path d="M16.6 7.4 l1.8 -1.8" />
    </NGIcon>
  );
}

// Upload
export function IconUpload(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M14 3 H6 a2 2 0 0 0 -2 2 v14 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 V9 z" />
      <path d="M14 3 v6 h6" />
      <path d="M12 19 v-7" />
      <path d="M9 15 l3 -3 l3 3" />
    </NGIcon>
  );
}

// Download
export function IconDownload(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 15 v3 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 v-3" />
      <path d="M12 4 v11" />
      <path d="M8 11 l4 4 l4 -4" />
    </NGIcon>
  );
}

// PDF file
export function IconPdf(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M14 3 H6 a2 2 0 0 0 -2 2 v14 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 V9 z" />
      <path d="M14 3 v6 h6" />
      <text x="12" y="18" fontSize="5" fontFamily="monospace" stroke="none" fill="currentColor" textAnchor="middle">PDF</text>
    </NGIcon>
  );
}

// Copy — two stacked sheets
export function IconCopy(p: IconProps) {
  return (
    <NGIcon {...p}>
      <rect x="4" y="4" width="12" height="14" rx="1.5" />
      <path d="M8 4 v-1 a1 1 0 0 1 1 -1 h10 a1 1 0 0 1 1 1 v13 a1 1 0 0 1 -1 1 h-3" />
    </NGIcon>
  );
}

// Code brackets
export function IconCode(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M9 7 L3.5 12 L9 17" />
      <path d="M15 7 L20.5 12 L15 17" />
      <path d="M14 5 L10 19" opacity={0.8} />
    </NGIcon>
  );
}

// Back arrow
export function IconBack(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M20 12 H4" />
      <path d="M10 6 L4 12 L10 18" />
    </NGIcon>
  );
}

// Clock
export function IconClock(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7 V12 L15.5 14" />
    </NGIcon>
  );
}

// Calendar
export function IconCalendar(p: IconProps) {
  return (
    <NGIcon {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10 h17" />
      <path d="M8 3 v4" />
      <path d="M16 3 v4" />
    </NGIcon>
  );
}

// User
export function IconUser(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20 c 0 -4, 3 -6, 7 -6 s 7 2, 7 6" />
    </NGIcon>
  );
}

// Close / X
export function IconClose(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M6 6 L18 18" />
      <path d="M18 6 L6 18" />
    </NGIcon>
  );
}

// Plus
export function IconPlus(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M12 5 v14" />
      <path d="M5 12 h14" />
    </NGIcon>
  );
}

// Chevron right
export function IconChevronRight(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M9 6 L15 12 L9 18" />
    </NGIcon>
  );
}

// Chevron left
export function IconChevronLeft(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M15 6 L9 12 L15 18" />
    </NGIcon>
  );
}

// Heart (favorites)
export function IconHeart(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M12 20 s -8 -5 -8 -11 a 4 4 0 0 1 8 -1 a 4 4 0 0 1 8 1 c 0 6 -8 11 -8 11 z" />
    </NGIcon>
  );
}

// Bookmark (save problem)
export function IconBookmark(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M6 3 h12 v18 l-6 -4 l-6 4 z" />
    </NGIcon>
  );
}

// Edit / Pencil
export function IconEdit(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M15.5 4.5 l4 4 l-10.5 10.5 l-5 1 l1 -5 z" />
      <path d="M13.5 6.5 l4 4" />
    </NGIcon>
  );
}

// Trash / Delete
export function IconTrash(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 7 h16" />
      <path d="M10 11 v6" />
      <path d="M14 11 v6" />
      <path d="M5 7 l1 12 a2 2 0 0 0 2 2 h8 a2 2 0 0 0 2 -2 l1 -12" />
      <path d="M9 7 v-2 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 v2" />
    </NGIcon>
  );
}

// Check / Checkmark
export function IconCheck(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M4 12 l5 5 l11 -11" />
    </NGIcon>
  );
}

// External link
export function IconExternalLink(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M18 13 v6 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 h6" />
      <path d="M15 3 h6 v6" />
      <path d="M10 14 L21 3" />
    </NGIcon>
  );
}

// Eye (view)
export function IconEye(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M1 12 s 4 -8, 11 -8 s 11 8, 11 8 s -4 8, -11 8 s -11 -8, -11 -8 z" />
      <circle cx="12" cy="12" r="3" />
    </NGIcon>
  );
}

// Info
export function IconInfo(p: IconProps) {
  return (
    <NGIcon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8 v0.5" strokeWidth={2} strokeLinecap="round" />
      <path d="M12 11 v6" />
    </NGIcon>
  );
}

// Warning / Alert
export function IconWarning(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M12 3 L22 21 H2 z" />
      <path d="M12 10 v5" />
      <path d="M12 18 v0.5" strokeWidth={2} strokeLinecap="round" />
    </NGIcon>
  );
}

/* ========================================================== */
/* RANK / HoF                                                  */
/* ========================================================== */

// Medal (rank badge)
export function IconMedal(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M7 3 l2 6" />
      <path d="M17 3 l-2 6" />
      <circle cx="12" cy="15" r="6" />
      <path d="M9 13.5 l2.5 2.5 l4 -4.5" strokeWidth={1.2} opacity={0.7} />
    </NGIcon>
  );
}

// Crown (top ranker)
export function IconCrown(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M3 7 L7 14 L12 6 L17 14 L21 7 L20 18 H4 z" />
      <path d="M4 18 h16" />
    </NGIcon>
  );
}

// Ribbon
export function IconRibbon(p: IconProps) {
  return (
    <NGIcon {...p}>
      <path d="M8 3 h8 v11 l-4 -3 l-4 3 z" />
      <path d="M8 14 l -3 7 l 4 -1 l 3 3" />
      <path d="M16 14 l 3 7 l -4 -1 l -3 3" />
    </NGIcon>
  );
}

/* ========================================================== */
/* MAP / INDEX                                                  */
/* ========================================================== */

export const NG_ICONS: Record<string, React.ComponentType<IconProps>> = {
  // nav
  Dashboard: IconDashboard, Menu: IconMenu, Receipt: IconReceipt,
  TrophyMug: IconTrophyMug, Pen: IconPen, Chart: IconChart,
  // brand
  Bean: IconBean, Cup: IconCup, Kettle: IconKettle,
  // verdicts
  Brewed: IconBrewed, Steeping: IconSteeping, Burnt: IconBurnt,
  Spilled: IconSpilled, Timeout: IconTimeout, CompileErr: IconCompileErr,
  // difficulty
  RoastLight: IconRoastLight, RoastMedium: IconRoastMedium,
  RoastDark: IconRoastDark, Espresso: IconEspresso,
  // topics
  Array: IconArray, Graph: IconGraph, Tree: IconTree, DP: IconDP,
  Greedy: IconGreedy, String: IconString, Math: IconMath,
  Geometry: IconGeometry, Sort: IconSort, Search: IconSearch, Bits: IconBits,
  // actions
  Submit: IconSubmit, Play: IconPlay, Filter: IconFilter, Bell: IconBell,
  Gear: IconGear, Upload: IconUpload, Download: IconDownload, Pdf: IconPdf,
  Copy: IconCopy, Code: IconCode, Back: IconBack, Clock: IconClock,
  Calendar: IconCalendar, User: IconUser, Close: IconClose, Plus: IconPlus,
  ChevronRight: IconChevronRight, ChevronLeft: IconChevronLeft,
  Heart: IconHeart, Bookmark: IconBookmark, Edit: IconEdit, Trash: IconTrash,
  Check: IconCheck, ExternalLink: IconExternalLink, Eye: IconEye,
  Info: IconInfo, Warning: IconWarning,
  // rank
  Medal: IconMedal, Crown: IconCrown, Ribbon: IconRibbon,
};
