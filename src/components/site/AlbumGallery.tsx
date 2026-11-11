"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Close, Expand } from "./Icons";

export type Tile = { title: string; imageUrl: string; albumId: string; span: number };
export type Album = { id: string; title: string };
export type AlbumPhoto = { albumId: string; imageUrl: string; caption: string; ratio: number };

type Props = { tiles: Tile[]; albums: Album[]; photos: AlbumPhoto[] };

export default function AlbumGallery({ tiles, albums, photos }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const album = albums.find((entry) => entry.id === openId) ?? null;
  const albumPhotos = album ? photos.filter((photo) => photo.albumId === album.id) : [];
  const hasAlbum = (id: string) => photos.some((photo) => photo.albumId === id);

  const scrollToTop = () =>
    window.setTimeout(
      () => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      30,
    );

  const openAlbum = (id: string) => {
    setOpenId(id);
    setLightbox(null);
    scrollToTop();
  };

  const closeAlbum = () => {
    setOpenId(null);
    setLightbox(null);
    scrollToTop();
  };

  const move = useCallback(
    (direction: number) =>
      setLightbox((current) => {
        if (current === null || albumPhotos.length === 0) return current;
        return (current + direction + albumPhotos.length) % albumPhotos.length;
      }),
    [albumPhotos.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, move]);

  const current = lightbox !== null ? albumPhotos[lightbox] : null;
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <div ref={rootRef} className="gallery-root">
      {!album ? (
        <div className="gallery-covers">
          {tiles.map((tile, index) => {
            const clickable = tile.albumId && hasAlbum(tile.albumId);
            const content = (
              <>
                {tile.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tile.imageUrl} alt={tile.title || ""} loading="lazy" />
                ) : null}
                {tile.title || clickable ? (
                  <>
                    <span className="cover-gradient" aria-hidden="true" />
                    <span className="cover-title">
                      <h3>{tile.title}</h3>
                      {clickable ? (
                        <span className="cover-icon" aria-hidden="true">
                          <ArrowRight width={18} height={18} />
                        </span>
                      ) : null}
                    </span>
                  </>
                ) : null}
              </>
            );
            const cls = `gallery-cover${tile.span === 2 ? " cover-span-2" : ""}`;
            return clickable ? (
              <button
                key={`${tile.albumId}-${index}`}
                type="button"
                className={cls}
                onClick={() => openAlbum(tile.albumId)}
                aria-label={`Ouvrir l’album ${tile.title || albums.find((entry) => entry.id === tile.albumId)?.title || ""}`.trim()}
              >
                {content}
              </button>
            ) : (
              <div key={`tile-${index}`} className={cls}>
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="album-page">
          <button type="button" className="back-to-gallery" onClick={closeAlbum}>
            <ArrowLeft width={17} height={17} /> Retour à la galerie
          </button>
          <div className="album-heading">
            <h3>{album.title}</h3>
            <span className="album-count">
              {albumPhotos.length} photo{albumPhotos.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="album-rows">
            {albumPhotos.map((photo, index) => {
              const ratio = photo.ratio > 0 ? photo.ratio : 1.33;
              return (
                <button
                  key={`${photo.imageUrl}-${index}`}
                  type="button"
                  className="album-photo"
                  style={{ flex: `${ratio} 1 ${Math.round(ratio * 230)}px`, aspectRatio: String(ratio) }}
                  onClick={() => setLightbox(index)}
                  aria-label={`Agrandir la photo ${index + 1}${photo.caption ? ` : ${photo.caption}` : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.imageUrl} alt={photo.caption || `${album.title} — photo ${index + 1}`} loading="lazy" />
                  <span className="album-zoom" aria-hidden="true">
                    <Expand width={16} height={16} />
                  </span>
                  {photo.caption ? <span className="album-caption">{photo.caption}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {current ? (
        <div
          className="dialog-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${album?.title ?? "Album"} — photo ${(lightbox ?? 0) + 1} sur ${albumPhotos.length}`}
          onClick={() => setLightbox(null)}
        >
          <div className="lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button
              ref={closeRef}
              type="button"
              className="lightbox-close round-button"
              onClick={() => setLightbox(null)}
              aria-label="Fermer"
            >
              <Close width={18} height={18} />
            </button>
            <figure className="lightbox-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.imageUrl} alt={current.caption || album?.title || ""} />
              <figcaption>
                <span>{current.caption || album?.title}</span>
                <span>
                  {pad((lightbox ?? 0) + 1)} / {pad(albumPhotos.length)}
                </span>
              </figcaption>
            </figure>
            <div className="lightbox-controls">
              <button type="button" className="round-button" onClick={() => move(-1)} aria-label="Photo précédente">
                <ArrowLeft width={18} height={18} />
              </button>
              <button type="button" className="round-button" onClick={() => move(1)} aria-label="Photo suivante">
                <ArrowRight width={18} height={18} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
