import Link from "next/link";
import type { Site } from "@/db/schema";
import type { NavItem } from "./SiteHeader";

type Props = {
  site: Site;
  nav: NavItem[];
  activities: NavItem[];
  legal: NavItem | null;
  homeHref: string;
  contactHref: string;
};

export default function SiteFooter({ site, nav, activities, legal, homeHref, contactHref }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className={`footer-grid${activities.length > 0 ? " footer-grid--4" : ""}`}>
          <div>
            <Link href={homeHref} className="brand" style={{ color: "#fff" }}>
              <span
                className="brand-mark"
                aria-hidden="true"
                style={{ background: "#ffffff", color: "#0b1220" }}
              >
                {site.logoMark}
              </span>
              <span>
                <span className="footer-brand">{site.name}</span>
                <span className="brand-role" style={{ color: "#93a3bb" }}>
                  {site.role}
                </span>
              </span>
            </Link>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#b9c6d8", maxWidth: "42ch" }}>
              {site.footerNote}
            </p>
          </div>

          <div>
            <p className="footer-title">Navigation</p>
            <ul className="footer-list">
              {nav.map((item) => (
                <li key={`f-${item.href}`}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {activities.length > 0 ? (
            <div>
              <p className="footer-title">Mes missions</p>
              <ul className="footer-list">
                {activities.map((item) => (
                  <li key={`a-${item.href}`}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className="footer-title">Contact</p>
            <ul className="footer-list">
              {site.contactEmail ? (
                <li>
                  <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
                </li>
              ) : null}
              {site.contactPhone ? (
                <li>
                  <a href={`tel:${site.contactPhone.replace(/\s/g, "")}`}>{site.contactPhone}</a>
                </li>
              ) : null}
              {site.address ? (
                <li style={{ whiteSpace: "pre-line", color: "#b9c6d8" }}>{site.address}</li>
              ) : null}
              {site.openingHours ? (
                <li style={{ color: "#b9c6d8" }}>{site.openingHours}</li>
              ) : null}
              <li>
                <Link href={contactHref}>Formulaire de contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {site.name}. {site.legalNote}
          </span>
          <span style={{ display: "inline-flex", gap: "1rem", flexWrap: "wrap" }}>
            {legal ? <Link href={legal.href}>{legal.label}</Link> : null}
            <Link href="/admin">Espace admin</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
