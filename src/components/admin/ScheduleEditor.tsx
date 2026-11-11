"use client";

import { useId } from "react";
import { DAY_KEYS, DAY_LABELS, normalizeSchedule, type DayKey } from "@/lib/hours";
import type { DaySchedule, ScheduleData } from "@/db/schema";

type Range = { start: string; end: string };

export default function ScheduleEditor({ value, onChange }: { value: unknown; onChange: (next: ScheduleData) => void }) {
  const schedule = normalizeSchedule(value);
  const uid = useId();
  const update = (day: DayKey, patch: Partial<DaySchedule>) => {
    onChange({ ...schedule, [day]: { ...schedule[day], ...patch } });
  };
  const updateTime = (day: DayKey, index: number, key: keyof Range, value: string) => {
    const ranges = schedule[day].ranges.map((r) => ({ ...r }));
    while (ranges.length <= index) ranges.push(index === 0 ? { start: "08:15", end: "12:15" } : { start: "13:30", end: "17:15" });
    ranges[index][key] = value;
    update(day, { ranges });
  };

  return (
    <div className="schedule-editor">
      <p className="hint" style={{ marginBottom: "0.7rem" }}>
        Heure de Paris. « Sur rendez-vous » ne met jamais automatiquement le voyant au vert : seuls les horaires d’ouverture normale le font. Le statut peut toujours être forcé dans les réglages.
      </p>
      {DAY_KEYS.map((day) => {
        const entry = schedule[day];
        const mode = entry.closed ? "closed" : entry.appointmentOnly ? "appointment" : "open";
        return (
          <div className="schedule-day-editor" key={day}>
            <div className="schedule-row">
              <label className="schedule-day" htmlFor={`${uid}-${day}-mode`}>{DAY_LABELS[day]}</label>
              <select
                id={`${uid}-${day}-mode`}
                className="select schedule-mode"
                value={mode}
                onChange={(event) => {
                  const mode = event.target.value;
                  update(day, {
                    closed: mode === "closed",
                    appointmentOnly: mode === "appointment",
                    ranges: mode === "open" && entry.ranges.length === 0
                      ? [{ start: "08:15", end: "12:15" }, { start: "13:30", end: "17:15" }]
                      : entry.ranges,
                  });
                }}
              >
                <option value="open">Ouverture normale</option>
                <option value="appointment">Sur rendez-vous uniquement</option>
                <option value="closed">Fermé</option>
              </select>
              {mode === "open" ? (
                <div className="schedule-times">
                  {[0, 1].map((index) => (
                    <span className="schedule-time-pair" key={index}>
                      {index === 1 ? <span>et</span> : null}
                      <input type="time" className="input" value={entry.ranges[index]?.start || ""}
                        onChange={(event) => updateTime(day, index, "start", event.target.value)}
                        aria-label={`${DAY_LABELS[day]} — début ${index === 0 ? "matin" : "après-midi"}`} />
                      <span>–</span>
                      <input type="time" className="input" value={entry.ranges[index]?.end || ""}
                        onChange={(event) => updateTime(day, index, "end", event.target.value)}
                        aria-label={`${DAY_LABELS[day]} — fin ${index === 0 ? "matin" : "après-midi"}`} />
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            {mode !== "closed" ? (
              <div className="field schedule-note-field">
                <label htmlFor={`${uid}-${day}-note`}>Conditions d’accueil / précisions pour {DAY_LABELS[day].toLowerCase()}</label>
                <textarea id={`${uid}-${day}-note`} className="textarea" rows={2} value={entry.note || ""}
                  placeholder="Ex : déclaration ValoDépôt obligatoire / plus de 500 kg, prévenir 48 h à l’avance…"
                  onChange={(event) => update(day, { note: event.target.value })} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
