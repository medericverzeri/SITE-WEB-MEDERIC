"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ScheduleData } from "@/db/schema";
import { computeStatus, frTime, groupOpenDays, type OpenStatus } from "@/lib/hours";
import { Clock } from "./Icons";
import { resolvePortrait } from "@/lib/portrait";

type StatusInput = {
  schedule: ScheduleData;
  override: string;
  openNote?: string;
  closedNote?: string;
};

/** Statut ouvert / fermé recalculé toutes les 30 secondes (heure de Paris). */
export function useLiveStatus({ schedule, override, openNote, closedNote }: StatusInput): OpenStatus {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return computeStatus(schedule, override, now ?? new Date(), {
    open: openNote,
    closed: closedNote,
  });
}

type PortraitProps = StatusInput & {
  portraitUrl: string;
  portraitAlt: string;
  name: string;
  sideLabel: string;
  initials: string;
};

/** Portrait entouré d'un anneau VERT (disponible) ou ROUGE (fermé). */
export function PortraitFrame({
  portraitUrl,
  portraitAlt,
  name,
  sideLabel,
  initials,
  ...status
}: PortraitProps) {
  const live = useLiveStatus(status);
  const color = live.open ? "#16a34a" : "#dc2626";
  const portrait = resolvePortrait(portraitUrl);

  return (
    <div
      className="home-portrait-area reveal"
      style={{ "--status": color } as CSSProperties}
    >
      <div className={`portrait-frame ${live.open ? "is-open" : "is-closed"}`}>
        <span className="portrait-orbit" aria-hidden="true" />
        {portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="home-portrait"
            src={portrait.src}
            srcSet={portrait.srcSet}
            sizes={portrait.sizes}
            alt={portraitAlt || name}
          />
        ) : (
          <span className="portrait-initials" aria-hidden="true">
            {initials}
          </span>
        )}
        <span
          className={`portrait-status ${live.open ? "portrait-status--open" : "portrait-status--closed"}`}
          suppressHydrationWarning
        >
          <span className="status-dot" aria-hidden="true" />
          {live.open ? "Disponible" : live.appointmentOnly ? "Sur rendez-vous" : "Fermé"}
        </span>
        <div className="portrait-signature">
          <strong>{name}</strong>
          <i aria-hidden="true" />
        </div>
      </div>
      {sideLabel ? <span className="portrait-side-label">{sideLabel}</span> : null}
      <p className="portrait-note" role="status" suppressHydrationWarning>
        <span className="status-dot" aria-hidden="true" />
        <strong>{live.headline}</strong> — {live.detail}
      </p>
    </div>
  );
}

type StripProps = StatusInput & { title: string };

/** Bandeau « Horaires d'ouverture » sous le portrait. */
export function OpeningStrip({ title, ...status }: StripProps) {
  const live = useLiveStatus(status);
  const groups = groupOpenDays(status.schedule);

  return (
    <div className="opening-strip">
      <div className="hours-title">
        <Clock />
        <span>{title}</span>
      </div>

      <div className="strip-groups">
        {groups.length === 0 ? (
          <p className="strip-row">Horaires communiqués sur demande</p>
        ) : (
          groups.map((group) => (
            <div className="strip-entry" key={group.label}>
              <div className="strip-row">
                <strong>{group.label}</strong>
                <span>
                  {group.appointmentOnly ? <span className="strip-appointment">Sur rendez-vous uniquement</span> : group.ranges.map((range, index) => {
                    const name = group.ranges.length === 2 ? (index === 0 ? "Matin" : "Après-midi") : "";
                    return (
                      <span className="strip-range" key={`${range.start}-${range.end}`}>
                        {name ? <em>{name}</em> : null}
                        {frTime(range.start)}–{frTime(range.end)}
                      </span>
                    );
                  })}
                </span>
              </div>
              {group.note ? <p className="strip-condition">{group.note}</p> : null}
            </div>
          ))
        )}
        {groups[0]?.hasClosedDays ? <p className="strip-closed">Fermé les autres jours</p> : null}
      </div>

      <div
        className={`strip-live ${live.open ? "is-open" : "is-closed"}`}
        role="status"
        suppressHydrationWarning
      >
        <span className="status-dot" aria-hidden="true" />
        <span>
          <strong>{live.headline}</strong>
          {live.detail}
        </span>
      </div>
    </div>
  );
}
