"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { sectionPageLink } from "@/lib/site-content";
import { useEffect, useRef, useState } from "react";
import ReadingComfort from "./ReadingComfort";
import { ArrowUpRight, Close } from "./Icons";

export type NavItem = { label: string; href: string };

type Props = {
  siteName: string;
  role: string;
  logoMark: string;
  homeHref: string;
  nav: NavItem[];
  ctaLabel: string;
  ctaHref: string;
  banner: { text: string; href: string } | null;
  currentPath: string;
};

export default function SiteHeader({
  siteName,
  role,
  logoMark,
  homeHref,
  nav,
  ctaLabel,
  ctaHref,
  banner,
  currentPath,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  useEffect(() => {
    const followLegacyLink = () => {
      if (window.location.pathname.replace(/\/$/, "") !== homeHref.replace(/\/$/, "")) return;
      const hash = window.location.hash;
      if (!hash) return;
      const destination = sectionPageLink(hash);
      if (destination === hash) return;
      const base = homeHref === "/" ? "" : homeHref;
      router.replace(`${base}${destination === "/" ? "" : destination}` || "/");
    };
    followLegacyLink();
    window.addEventListener("hashchange", followLegacyLink);
    return () => window.removeEventListener("hashchange", followLegacyLink);
  }, [homeHref, currentPath, router]);

  useEffect(() => {
    const elements = nav
      .map((item) => item.href.split("#")[1])
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    let frame = 0;
    const update = () => {
      setScrolled(window.scrollY > 20);
      const limit = (headerRef.current?.getBoundingClientRect().bottom ?? 120) + 80;
      const reached = elements.filter((element) => element.getBoundingClientRect().top <= limit);
      const active = reached[reached.length - 1] ?? elements[0];
      setActiveId(active?.id ?? "");
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [nav, currentPath]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header ref={headerRef} className="site-header site-header--refined" data-scrolled={scrolled}>
      {banner ? (
        <div className="banner">
          <div className="wrap banner-inner">
            <span>{banner.text}</span>
            {banner.href ? <Link href={banner.href}>En savoir plus →</Link> : null}
          </div>
        </div>
      ) : null}

      <div className="wrap header-bar">
        <Link href={homeHref} className="brand" aria-label={`${siteName} — accueil`}>
          <span className="brand-mark" aria-hidden="true">{logoMark}</span>
          <span className="header-identity">
            <span className="brand-name">{siteName}</span>
            <span className="brand-role">{role}</span>
          </span>
        </Link>
        <div className="header-tools">
          <ReadingComfort />
          <Link href={ctaHref} className="header-contact-link">
            <span>{ctaLabel}</span>
            <span className="header-contact-arrow"><ArrowUpRight width={17} height={17} /></span>
          </Link>
          <button
            ref={menuRef}
            type="button"
            className="header-menu-toggle"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span>{open ? "Fermer" : "Menu"}</span>
            {open ? <Close width={17} height={17} /> : (
              <svg width="20" height="17" viewBox="0 0 20 17" fill="none" aria-hidden="true">
                <path d="M2 4h16M7 12h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="header-navigation" data-open={open}>
        <div className="wrap header-navigation-inner">
          <span className="navigation-caption" aria-hidden="true">Explorer</span>
          <nav id="site-nav" className="site-nav" aria-label="Navigation principale">
            {nav.map((item, index) => {
              const anchor = item.href.split("#")[1];
              const active = anchor ? activeId === anchor : currentPath === item.href;
              return (
                <Link
                  key={`${item.href}-${index}`}
                  href={item.href}
                  className="nav-link"
                  aria-current={active ? (anchor ? "location" : "page") : undefined}
                  onClick={() => {
                    if (anchor) setActiveId(anchor);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <span className="navigation-indicator" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
