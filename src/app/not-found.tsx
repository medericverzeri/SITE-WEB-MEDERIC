import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ paddingBlock: "5rem", maxWidth: "720px" }}>
      <p className="eyebrow">Erreur 404</p>
      <h1 className="h1" style={{ marginBottom: "1rem" }}>
        Cette page n&apos;existe pas (ou plus).
      </h1>
      <p className="lead">
        Le lien que vous avez suivi est peut-être obsolète. Vous pouvez revenir à l&apos;accueil du
        site ou nous contacter directement.
      </p>
      <div className="hero-actions">
        <Link href="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
        <Link href="/developpement" className="btn btn-ghost">
          Espace entreprises
        </Link>
      </div>
    </main>
  );
}
