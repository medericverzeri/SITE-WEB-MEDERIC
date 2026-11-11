import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./refinements.css";

export const metadata: Metadata = {
  title: {
    default: "Déchet'Lab · Éco-Solidaire — Déchetterie professionnelle & insertion",
    template: "%s",
  },
  description:
    "Déchetterie professionnelle Déchet'Lab : dépôt des déchets d'entreprise, tri, réemploi et valorisation, avec une équipe en parcours d'insertion.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
