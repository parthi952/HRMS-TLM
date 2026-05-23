// Shared card styling tokens used across StatCard, Card, and similar components
export const cardTheme = {
  /** Base container for a stat/metric card — bg is intentionally omitted so callers supply their own via cardBgClass */
  statCard:
    "rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",

  /** General card wrapper (used in Card.tsx) */
  wrapper:
    "bg-white rounded-2xl border border-slate-100 shadow-sm",
};
