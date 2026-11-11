import type { DaySchedule, ScheduleData } from "@/db/schema";

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];
export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Lundi", tue: "Mardi", wed: "Mercredi", thu: "Jeudi", fri: "Vendredi", sat: "Samedi", sun: "Dimanche",
};
export const TIME_ZONE = "Europe/Paris";
const range = (start: string, end: string) => ({ start, end });
const weekdays = (start: string, end: string): DaySchedule => ({ closed: false, ranges: [range(start, end)] });

export const DEFAULT_SCHEDULE: ScheduleData = {
  mon: weekdays("08:30", "12:00"), tue: weekdays("08:30", "12:00"), wed: weekdays("08:30", "12:00"),
  thu: weekdays("08:30", "12:00"), fri: weekdays("08:30", "12:00"),
  sat: { closed: true, ranges: [] }, sun: { closed: true, ranges: [] },
};
export const DEFAULT_SCHEDULE_AFTERNOON: ScheduleData = Object.fromEntries(
  DAY_KEYS.map((day) => [day, day === "sat" || day === "sun"
    ? { closed: true, ranges: [] }
    : { closed: false, ranges: [range("08:30", "12:00"), range("13:30", "17:00")] }]),
);

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMinutes = (value: string): number => {
  if (!TIME.test(value)) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

/** Lecture et validation des jours, notes et rendez-vous. */
export function normalizeSchedule(input: unknown): ScheduleData {
  const source = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const result: ScheduleData = {};
  for (const day of DAY_KEYS) {
    const raw = source[day];
    if (!raw || typeof raw !== "object") {
      result[day] = { ...DEFAULT_SCHEDULE[day], ranges: DEFAULT_SCHEDULE[day].ranges.map((r) => ({ ...r })) };
      continue;
    }
    const entry = raw as { closed?: unknown; ranges?: unknown; appointmentOnly?: unknown; note?: unknown };
    const closed = entry.closed === true;
    const appointmentOnly = !closed && entry.appointmentOnly === true;
    const ranges = Array.isArray(entry.ranges)
      ? entry.ranges
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({ start: typeof item.start === "string" ? item.start : "", end: typeof item.end === "string" ? item.end : "" }))
          .filter((item) => TIME.test(item.start) && TIME.test(item.end) && toMinutes(item.end) > toMinutes(item.start))
          .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
          .slice(0, 3)
      : [];
    result[day] = {
      closed, appointmentOnly,
      ranges: ranges.length > 0 || closed || appointmentOnly ? ranges : [{ start: "08:30", end: "17:00" }],
      note: typeof entry.note === "string" ? entry.note.trim().slice(0, 1500) : "",
    };
  }
  return result;
}

function parisNow(now: Date): { day: DayKey; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const weekday = (parts.find((part) => part.type === "weekday")?.value ?? "Mon").toLowerCase().slice(0, 3);
  const day = DAY_KEYS.includes(weekday as DayKey) ? weekday as DayKey : "mon";
  const hours = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minutes = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return { day, minutes: hours * 60 + minutes };
}

export const frTime = (value: string): string => {
  const minutes = toMinutes(value);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
};

export function formatDaySchedule(day: DaySchedule): string {
  if (day.closed) return "Fermé";
  if (day.appointmentOnly) return "Sur rendez-vous uniquement";
  return day.ranges.map((r) => `${frTime(r.start)}–${frTime(r.end)}`).join(" · ");
}

export type OpenStatus = {
  open: boolean;
  headline: string;
  detail: string;
  dayLabel: string;
  todayRanges: string;
  isManual: boolean;
  appointmentOnly?: boolean;
};

/** Un jour sur rendez-vous ne devient jamais automatiquement « ouvert ». */
export function computeStatus(
  scheduleInput: unknown,
  override: string,
  now: Date = new Date(),
  notes: { open?: string; closed?: string } = {},
): OpenStatus {
  const schedule = normalizeSchedule(scheduleInput);
  const { day, minutes } = parisNow(now);
  const today = schedule[day];
  const context = { dayLabel: DAY_LABELS[day], todayRanges: formatDaySchedule(today) };

  if (override === "open" || override === "closed") {
    const open = override === "open";
    return {
      ...context, open, headline: open ? "Ouvert" : "Fermé", isManual: true,
      detail: open ? notes.open || "Disponible — contactez-nous avant votre venue" : notes.closed || "Fermé — laissez-nous un message",
    };
  }
  if (!today.closed && today.appointmentOnly) {
    return {
      ...context, open: false, headline: "Sur rendez-vous", isManual: false, appointmentOnly: true,
      detail: today.note || "Accueil uniquement sur rendez-vous confirmé. Contactez-nous avant de venir.",
    };
  }
  if (!today.closed) {
    const current = today.ranges.find((entry) => minutes >= toMinutes(entry.start) && minutes < toMinutes(entry.end));
    if (current) return { ...context, open: true, headline: "Ouvert maintenant", detail: `Fermeture à ${frTime(current.end)}`, isManual: false };
    const later = today.ranges.find((entry) => minutes < toMinutes(entry.start));
    if (later) return { ...context, open: false, headline: "Fermé", detail: `Réouverture aujourd’hui à ${frTime(later.start)}`, isManual: false };
  }
  const startIndex = DAY_KEYS.indexOf(day);
  for (let offset = 1; offset <= 7; offset += 1) {
    const key = DAY_KEYS[(startIndex + offset) % 7];
    const entry = schedule[key];
    if (!entry.closed && !entry.appointmentOnly && entry.ranges[0]) {
      const prefix = offset === 1 ? "demain" : DAY_LABELS[key].toLowerCase();
      return { ...context, open: false, headline: "Fermé", detail: `Réouverture ${prefix} à ${frTime(entry.ranges[0].start)}`, isManual: false };
    }
  }
  return { ...context, open: false, headline: "Fermé", detail: "Consultez les horaires et modalités de rendez-vous", isManual: false };
}

function daysLabel(days: DayKey[]): string {
  if (days.length === 7) return "Tous les jours";
  const names = days.map((day, i) => i === 0 ? DAY_LABELS[day] : DAY_LABELS[day].toLowerCase());
  return names.length <= 1 ? names[0] ?? "" : `${names.slice(0, -1).join(", ")} et ${names[names.length - 1]}`;
}

type HoursGroup = {
  label: string;
  ranges: { start: string; end: string }[];
  hasClosedDays: boolean;
  appointmentOnly: boolean;
  note: string;
};

/** Regroupe également les jours non consécutifs, en distinguant les rendez-vous. */
export function groupOpenDays(scheduleInput: unknown): HoursGroup[] {
  const schedule = normalizeSchedule(scheduleInput);
  const groups: { key: string; days: DayKey[]; entry: DaySchedule }[] = [];
  for (const day of DAY_KEYS) {
    const entry = schedule[day];
    if (entry.closed) continue;
    const key = `${Boolean(entry.appointmentOnly)}|${entry.ranges.map((r) => `${r.start}-${r.end}`).join("|")}|${entry.note || ""}`;
    const existing = groups.find((group) => group.key === key);
    if (existing) existing.days.push(day);
    else groups.push({ key, days: [day], entry });
  }
  const hasClosedDays = DAY_KEYS.some((day) => schedule[day].closed);
  return groups.map((group) => ({
    label: daysLabel(group.days), ranges: group.entry.ranges, hasClosedDays,
    appointmentOnly: Boolean(group.entry.appointmentOnly), note: group.entry.note || "",
  }));
}

export function scheduleSummary(scheduleInput: unknown): { label: string; hours: string }[] {
  const schedule = normalizeSchedule(scheduleInput);
  return DAY_KEYS.map((day) => ({ label: DAY_LABELS[day], hours: formatDaySchedule(schedule[day]) }));
}

export function tickerText(site: { name: string; marqueeText: string }, scheduleInput: unknown): string[] {
  return [
    ...(site.marqueeText || "").split("·").map((line) => line.trim()).filter(Boolean),
    ...groupOpenDays(scheduleInput).map((group) => `${group.label} : ${group.appointmentOnly ? "sur rendez-vous uniquement" : group.ranges.map((r) => `${frTime(r.start)}–${frTime(r.end)}`).join(" et ")}${group.note ? ` — ${group.note}` : ""}`),
  ];
}
