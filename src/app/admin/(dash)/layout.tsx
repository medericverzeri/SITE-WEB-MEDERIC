import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { isAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/data";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Espace admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const overview = await getAdminOverview();

  return (
    <div className="admin">
      <div className="admin-shell">
        <aside className="admin-side">
          <Link href="/admin" className="admin-brand">
            <span
              className="brand-mark"
              aria-hidden="true"
              style={{ background: "#1d4ed8", width: 38, height: 38, borderRadius: 11 }}
            >
              HA
            </span>
            <span>
              <span style={{ display: "block", fontWeight: 750, fontSize: "0.95rem" }}>
                Administration
              </span>
              <span style={{ display: "block", fontSize: "0.72rem", color: "#93a3bb" }}>
                2 sites · contenus dynamiques
              </span>
            </span>
          </Link>

          <AdminNav
            sites={overview.sites.map((site) => ({
              key: site.key,
              name: site.shortName || site.name,
              unread: site.unread,
            }))}
          />

          <div style={{ marginTop: "auto", display: "grid", gap: "0.4rem" }}>
            <a
              href="/"
              style={{
                display: "block",
                padding: "0.55rem 0.7rem",
                borderRadius: 9,
                background: "#16233a",
                color: "#dbe3ef",
                fontSize: "0.82rem",
                textDecoration: "none",
              }}
            >
              ↗ Voir le site encadrant
            </a>
            <a
              href="/developpement"
              style={{
                display: "block",
                padding: "0.55rem 0.7rem",
                borderRadius: 9,
                background: "#16233a",
                color: "#dbe3ef",
                fontSize: "0.82rem",
                textDecoration: "none",
              }}
            >
              ↗ Voir le site entreprise
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "0.55rem 0.7rem",
                  borderRadius: 9,
                  background: "transparent",
                  border: "1px solid #2b3b55",
                  color: "#c3cfe0",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </aside>

        <div className="admin-main">{children}</div>
      </div>
    </div>
  );
}
