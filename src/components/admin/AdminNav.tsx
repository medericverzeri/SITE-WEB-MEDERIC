"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteRef = { key: string; name: string; unread: number };

export default function AdminNav({ sites }: { sites: SiteRef[] }) {
  const pathname = usePathname();

  const link = (href: string, label: string, exact = false) => {
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link key={href} href={href} data-active={active}>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div>
      <div className="admin-nav">
        {link("/admin", "Vue d'ensemble", true)}
        {link("/admin/messages", "Messages")}
      </div>
      <p
        style={{
          margin: "1.1rem 0.7rem 0.4rem",
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#7b8ba4",
          fontWeight: 700,
        }}
      >
        Contenus du site
      </p>
      <div className="admin-nav">
        {sites.map((site) =>
          link(`/admin/site/${site.key}`, `${site.name}${site.unread ? ` (${site.unread})` : ""}`),
        )}
      </div>
      <p
        style={{
          margin: "1.1rem 0.7rem 0.4rem",
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#7b8ba4",
          fontWeight: 700,
        }}
      >
        Ressources
      </p>
      <div className="admin-nav">{link("/admin/aide", "Déploiement Vercel")}</div>
    </div>
  );
}
