import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const REQUIRED = [
  "package.json", "package-lock.json", "tsconfig.json", "next.config.ts",
  "postcss.config.mjs", "vercel.json", "drizzle.vercel.ts",
  "src/app/layout.tsx", "src/app/page.tsx", "src/app/globals.css",
  "src/app/admin/actions.ts", "src/db/index.ts", "src/db/schema.ts",
  "src/db/bootstrap.ts", "src/db/bootstrap.sql",
  "src/components/site/SitePageView.tsx",
];

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(name);
    return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) ? [name] : [];
  });
}

function importsOf(source) {
  const result = new Set();
  const add = (node) => {
    if (node && ts.isStringLiteralLike(node) && node.text.startsWith("@/")) result.add(node.text);
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier);
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) add(node.argument.literal);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) add(node.arguments[0]);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}

export function checkDeployment(projectRoot = process.cwd()) {
  const root = path.resolve(projectRoot);
  const errors = [];
  for (const file of REQUIRED) {
    if (!fs.existsSync(path.join(root, file))) errors.push(`Fichier absent : ${file}`);
  }
  if (errors.length) return { errors, aliases: 0, assets: 0, sourceCount: 0 };

  const configPath = path.join(root, "tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    errors.push(`tsconfig.json illisible : ${ts.flattenDiagnosticMessageText(configFile.error.messageText, " ")}`);
    return { errors, aliases: 0, assets: 0, sourceCount: 0 };
  }
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root, undefined, configPath);
  for (const error of parsed.errors) errors.push(`Configuration TypeScript : ${ts.flattenDiagnosticMessageText(error.messageText, " ")}`);

  const source = sourceFiles(path.join(root, "src"));
  let aliases = 0;
  const aliasHost = path.join(root, "src/app/page.tsx");
  for (const [alias, expected] of [
    ["@/db", "src/db/index.ts"],
    ["@/lib/data", "src/lib/data.ts"],
    ["@/components/site/SitePageView", "src/components/site/SitePageView.tsx"],
  ]) {
    const resolved = ts.resolveModuleName(alias, aliasHost, parsed.options, ts.sys).resolvedModule;
    if (!resolved || path.resolve(resolved.resolvedFileName) !== path.join(root, expected)) {
      errors.push(`Alias incorrect : ${alias}. Le fichier tsconfig.json doit relier @/* à ./src/*, depuis la racine du projet.`);
    }
  }
  for (const file of source) {
    const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    for (const alias of importsOf(ast)) {
      aliases += 1;
      if (!ts.resolveModuleName(alias, file, parsed.options, ts.sys).resolvedModule) {
        errors.push(`Import introuvable : ${alias} dans ${path.relative(root, file)} (vérifier aussi les majuscules/minuscules).`);
      }
    }
  }

  let assets = 0;
  const mediaFile = path.join(root, "src/lib/media.ts");
  if (!fs.existsSync(mediaFile)) errors.push("Fichier absent : src/lib/media.ts");
  else {
    const ast = ts.createSourceFile(mediaFile, fs.readFileSync(mediaFile, "utf8"), ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "REF_IMAGES" && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
        for (const property of node.initializer.properties) {
          if (!ts.isPropertyAssignment(property) || !ts.isStringLiteralLike(property.initializer)) continue;
          const url = property.initializer.text;
          if (!url.startsWith("/images/")) continue;
          assets += 1;
          if (!fs.existsSync(path.join(root, "public", url.slice(1)))) errors.push(`Image absente : public${url}`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
  }
  if (assets === 0) errors.push("La bibliothèque d’images n’a pas pu être vérifiée.");
  if (!fs.existsSync(path.join(root, "public/images/ref/favicon.svg"))) errors.push("Image absente : public/images/ref/favicon.svg");

  const manifestPath = path.join(root, "DEPLOYMENT_MANIFEST.json");
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      if (!Array.isArray(manifest.files)) throw new Error("liste de fichiers manquante");
      for (const entry of manifest.files) {
        const file = typeof entry === "string" ? entry : entry?.path;
        if (typeof file !== "string" || path.isAbsolute(file) || file.split(/[\\/]/).includes("..")) throw new Error("chemin invalide");
        if (!fs.existsSync(path.join(root, file))) errors.push(`Export incomplet : ${file}`);
      }
    } catch {
      errors.push("DEPLOYMENT_MANIFEST.json est illisible. Remettre le fichier fourni dans l’archive.");
    }
  }
  return { errors: [...new Set(errors)], aliases, assets, sourceCount: source.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkDeployment();
  if (result.errors.length) {
    console.error("\n[Contrôle de déploiement] Le projet est incomplet ou sa configuration est incorrecte.");
    for (const message of result.errors.slice(0, 20)) console.error(`- ${message}`);
    if (result.errors.length > 20) console.error(`- … et ${result.errors.length - 20} autre(s) élément(s) manquant(s).`);
    console.error("\nPublier tout le contenu de l’archive : fichiers racine, scripts/, src/ et public/. Dans Vercel, Root Directory doit être le dossier contenant package.json et tsconfig.json.\n");
    process.exitCode = 1;
  } else {
    console.log(`[Contrôle de déploiement] OK : ${result.aliases} imports @/ résolus, ${result.assets} images et ${result.sourceCount} fichiers source vérifiés.`);
  }
}
