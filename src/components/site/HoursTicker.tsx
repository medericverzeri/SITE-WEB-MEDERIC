"use client";

import { groupOpenDays, tickerText } from "@/lib/hours";
import { useLiveStatus } from "./LiveStatus";
import type { Site } from "@/db/schema";

/** Horaires et statut réactualisés, avec des conditions distinctes pour les rendez-vous. */
export default function HoursTicker({ site, ctaHref }: { site: Site; ctaHref: string }) {
  const status = useLiveStatus({
    schedule: site.schedule, override: site.statusOverride,
    openNote: site.statusNoteOpen, closedNote: site.statusNoteClosed,
  });
  if (!site.marqueeEnabled) return null;
  const groups = groupOpenDays(site.schedule);
  const messages = [
    `${status.headline} · ${status.detail}`,
    ...tickerText(site, site.schedule),
    groups[0]?.hasClosedDays ? "Fermé les autres jours" : "",
  ].filter(Boolean);

  return (
    <div className={`ticker${status.open ? " ticker--open" : " ticker--closed"}`}>
      <div className="ticker-status" suppressHydrationWarning>
        <span className="status-dot" aria-hidden="true" />
        {status.open ? "Ouvert" : status.appointmentOnly ? "Sur RDV" : "Fermé"}
      </div>
      <div className="ticker-track" aria-label="Horaires d’ouverture et conditions d’accueil">
        <div className={`ticker-content ticker-content--${site.marqueeSpeed || "normal"}`}>
          {[...messages, ...messages].map((message, index) => (
            <span className="ticker-item" key={index} aria-hidden={index >= messages.length} suppressHydrationWarning>
              <span className="ticker-star" aria-hidden="true">✦</span>{message}
            </span>
          ))}
        </div>
      </div>
      <a className="ticker-cta" href={ctaHref}>{site.ctaLabel || "Contact"}<span aria-hidden="true">→</span></a>
    </div>
  );
}
