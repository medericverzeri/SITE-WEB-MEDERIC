import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "../actions";
import { DEFAULT_ADMIN_PASSWORD, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion — Espace admin",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const usingDefaultPassword = !process.env.ADMIN_PASSWORD;

  return (
    <div className="admin admin-login">
      <div className="admin-login-card">
        <p className="pill">Espace d&apos;administration</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.75rem" }}>
          Gestion du site
        </h1>
        <p style={{ color: "#5b6678", fontSize: "0.9rem", marginTop: "0.35rem" }}>
          Saisissez le mot de passe pour modifier les textes, les images, les couleurs et consulter
          les messages reçus.
        </p>

        <form action={loginAction} style={{ marginTop: "1.25rem" }}>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete="current-password"
              required
              autoFocus
            />
          </div>
          {error ? (
            <p className="form-error" role="alert">
              Mot de passe incorrect. Merci de réessayer.
            </p>
          ) : null}
          <button type="submit" className="a-btn a-btn--primary" style={{ width: "100%", marginTop: "0.6rem" }}>
            Se connecter
          </button>
        </form>

        {usingDefaultPassword ? (
          <p className="note" style={{ fontSize: "0.82rem" }}>
            <strong>Démonstration</strong> — mot de passe par défaut : {DEFAULT_ADMIN_PASSWORD}.
            Pour le changer, définissez la variable d&apos;environnement <code>ADMIN_PASSWORD</code>{" "}
            sur Vercel.
          </p>
        ) : null}

        <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "#5b6678" }}>
          <Link href="/">← Revenir au site public</Link>
        </p>
      </div>
    </div>
  );
}
