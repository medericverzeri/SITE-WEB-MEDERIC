"use client";

import { useEffect, useState } from "react";
import { computeStatus, DAY_KEYS, DAY_LABELS, formatDaySchedule, normalizeSchedule } from "@/lib/hours";
import type { ScheduleData } from "@/db/schema";
import type { CSSProperties } from "react";
import { resolvePortrait } from "@/lib/portrait";

type Props = {
  photoUrl: string;
  photoAlt: string;
  name: string;
  role: string;
  schedule: ScheduleData;
  override: string;
  openNote: string;
  closedNote: string;
  email: string;
  phone: string;
  emailLabel: string;
  phoneLabel: string;
  showSchedule: boolean;
  streetAddress: string;
};

export default function StatusCard({
  photoUrl,
  photoAlt,
  name,
  role,
  schedule,
  override,
  openNote,
  closedNote,
  email,
  phone,
  emailLabel,
  phoneLabel,
  showSchedule,
  streetAddress,
}: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const status = computeStatus(schedule, override, now ?? new Date(), {
    open: openNote,
    closed: closedNote,
  });
  const normalized = normalizeSchedule(schedule);
  const portrait = resolvePortrait(photoUrl);

  return (
    <div className="status-card" style={{ "--status": status.open ? "#16a34a" : "#dc2626" } as CSSProperties}>
      <div className="status-photo">
        {photoUrl ? (
          <img
            src={portrait.src}
            srcSet={portrait.srcSet}
            sizes={portrait.sizes}
            alt={photoAlt || `${name} — ${role}`}
            loading="lazy"
          />
        ) : (
          <div className="status-photo-fallback" aria-hidden="true">
            {name.slice(0, 1) || "?"}
          </div>
        )}
        <span className={`status-badge ${status.open ? "status-badge--open" : "status-badge--closed"}`}>
          <span className="status-dot" aria-hidden="true" />
          {status.headline}
        </span>
      </div>

      <div className="status-body">
        <div>
          <p className="status-name">{name}</p>
          <p className="status-role">{role}</p>
        </div>

        <div className={`status-line ${status.open ? "is-open" : "is-closed"}`}>
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>{status.headline}</strong>
            <span>{status.detail}</span>
          </div>
        </div>

        <p className="status-today">
          {status.dayLabel} · {status.todayRanges}
          {status.isManual ? " · statut mis à jour manuellement" : ""}
        </p>

        {showSchedule ? (
          <ul className="status-hours">
            {DAY_KEYS.map((day) => {
              const entry = normalized[day];
              return (
                <li key={day} data-today={status.dayLabel === DAY_LABELS[day]}>
                  <span>{DAY_LABELS[day]}</span>
                  <div className="status-day-detail">
                    <span>{formatDaySchedule(entry)}</span>
                    {!entry.closed && entry.note ? <small>{entry.note}</small> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="status-actions">
          {email ? (
            <a className="status-action" href={`mailto:${email}`}>
              <span aria-hidden="true">✉</span>
              {emailLabel || "Envoyer un e-mail"}
            </a>
          ) : null}
          {phone ? (
            <a className="status-action" href={`tel:${phone.replace(/\s/g, "")}`}>
              <span aria-hidden="true">☎</span>
              {phoneLabel || phone}
            </a>
          ) : null}
        </div>

        {streetAddress ? <p className="status-address">{streetAddress}</p> : null}
      </div>
    </div>
  );
}
