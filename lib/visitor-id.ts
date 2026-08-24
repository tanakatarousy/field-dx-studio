const VISITOR_KEY = "field_dx_visitor_id";

export const VISITOR_COLORS = [
  "#5b7183",
  "#8a645d",
  "#6d7660",
  "#756b86",
  "#8a744f",
  "#527878",
  "#7d6472",
  "#66717c",
];

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const random = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const value = `v_${random}`;
  window.localStorage.setItem(VISITOR_KEY, value);
  return value;
}

export function getVisitorColor(visitorId: string): string {
  let hash = 0;
  for (let index = 0; index < visitorId.length; index += 1) {
    hash = ((hash << 5) - hash + visitorId.charCodeAt(index)) | 0;
  }
  return VISITOR_COLORS[Math.abs(hash) % VISITOR_COLORS.length];
}
