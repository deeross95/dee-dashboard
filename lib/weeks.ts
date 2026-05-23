import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from "date-fns";

export function getWeekKey(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return format(start, "yyyy-MM-dd");
}

export function getWeekLabel(weekKey: string): string {
  const start = new Date(weekKey + "T12:00:00");
  const end = endOfWeek(start, { weekStartsOn: 1 });
  return `${format(start, "MMM d")} — ${format(end, "MMM d, yyyy")}`;
}

export function nextWeekKey(weekKey: string): string {
  const date = new Date(weekKey + "T12:00:00");
  return getWeekKey(addWeeks(date, 1));
}

export function prevWeekKey(weekKey: string): string {
  const date = new Date(weekKey + "T12:00:00");
  return getWeekKey(subWeeks(date, 1));
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
