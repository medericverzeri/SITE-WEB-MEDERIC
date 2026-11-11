const HIGH_QUALITY = "/images/portrait-mederic.webp";
const HIGH_QUALITY_SRCSET = "/images/portrait-mederic-660.webp 660w, /images/portrait-mederic.webp 1320w";

/** Compatibilité avec les anciens chemins du portrait et activation du WebP haute qualité. */
export function resolvePortrait(url: string): { src: string; srcSet?: string; sizes: string } {
  const isLegacy =
    url === "/images/ref/MAHQDsvF0sc.webp" ||
    url === "/images/ref/MAHH9Xka0ns.webp" ||
    url === "/images/portrait-mederic-hd.webp" ||
    url === HIGH_QUALITY;
  if (isLegacy) return { src: HIGH_QUALITY, srcSet: HIGH_QUALITY_SRCSET, sizes: "(max-width: 1024px) 88vw, 430px" };
  return { src: url, sizes: "(max-width: 1024px) 88vw, 430px" };
}
