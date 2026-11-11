#!/usr/bin/env python3
"""Livraison complète du site, sans secrets, données PostgreSQL ni outils de transfert."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from datetime import datetime, timezone
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "dechet-lab-vercel/"
ROOT_FILES = [
    "package.json", "package-lock.json", "tsconfig.json", "next.config.ts", "vercel.json",
    "postcss.config.mjs", "eslint.config.mjs", "next-env.d.ts", "drizzle.vercel.ts",
    ".gitignore", ".env.example", "README.md", "LIRE-EN-PREMIER.md",
    "DEPLOIEMENT_VERCEL.md", "REPARATION_VERCEL.md", "src/db/bootstrap.sql",
]
FORBIDDEN_DIRS = {"node_modules", ".git", ".next", ".vercel", "downloads", "exports", ".qa", "__pycache__"}


def export():
    subprocess.run(["node", "scripts/check-deployment.mjs"], cwd=ROOT, check=True)
    for filename in ROOT_FILES:
        file = ROOT / filename
        if not file.is_file() or file.is_symlink():
            raise RuntimeError(f"Fichier requis absent ou lien symbolique : {filename}")
    for line in (ROOT / ".env.example").read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        key, value = line.split("=", 1)
        if value.strip() and not (key.strip() == "PRIMARY_SITE_KEY" and value.strip() in {"encadrant", "developpement"}):
            raise RuntimeError("L’exemple .env.example ne doit contenir aucun secret.")

    files = [ROOT / name for name in ROOT_FILES]
    for folder in ["src", "scripts", "public/images"]:
        for file in sorted((ROOT / folder).rglob("*")):
            relative = file.relative_to(ROOT)
            if not file.is_file() or file.is_symlink():
                continue
            if any(part.startswith(".") or part in FORBIDDEN_DIRS for part in relative.parts):
                continue
            if file.suffix in {".log", ".pyc", ".zip", ".sql", ".db", ".sqlite", ".sqlite3"}:
                continue
            files.append(file)
    files = list(dict.fromkeys(files))

    created = datetime.now(timezone.utc).isoformat()
    manifest = {
        "format": "site-mederic-vercel-complet-v1",
        "createdAt": created,
        "files": [{"path": file.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(file.read_bytes()).hexdigest()} for file in files],
    }
    destination = ROOT / "exports/site-mederic-vercel-complet.zip"
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".zip.tmp")
    with ZipFile(temporary, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for file in files:
            archive.write(file, PREFIX + file.relative_to(ROOT).as_posix())
        archive.writestr(PREFIX + "DEPLOYMENT_MANIFEST.json", json.dumps(manifest, ensure_ascii=False, indent=2))
        archive.writestr(PREFIX + "EXPORT_INFO.txt", f"Livraison complète pour Vercel — {created}\nLire LIRE-EN-PREMIER.md.\nSources, configurations et photos incluses.\nAucun secret, message reçu, résultat de compilation ou donnée PostgreSQL inclus.\n")

    with ZipFile(temporary) as archive:
        if archive.testzip() is not None:
            raise RuntimeError("Archive endommagée")
        for name in archive.namelist():
            relative = Path(name).relative_to("dechet-lab-vercel")
            if ".." in relative.parts or any(part in FORBIDDEN_DIRS or part == ".github" for part in relative.parts):
                raise RuntimeError("Chemin interdit dans l’archive")
            if relative.name == "drizzle.config.json" or (relative.name.startswith(".env") and relative.name != ".env.example"):
                raise RuntimeError("Fichier local ou secret interdit dans l’archive")
            if relative.suffix == ".sql" and relative.as_posix() != "src/db/bootstrap.sql":
                raise RuntimeError("Seul le schéma initial sans données est autorisé")
        for file in files:
            if archive.read(PREFIX + file.relative_to(ROOT).as_posix()) != file.read_bytes():
                raise RuntimeError("Contenu de l’archive non conforme")

    temporary.replace(destination)
    print(f"Livraison vérifiée : {len(files) + 2} fichiers, {destination.stat().st_size / 1024 / 1024:.2f} Mo.")
    print("Aucun secret, message, cache ou donnée PostgreSQL inclus.")
    print("SHA-256 :", hashlib.sha256(destination.read_bytes()).hexdigest())


if __name__ == "__main__":
    export()
