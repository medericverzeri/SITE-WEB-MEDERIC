"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "./Icons";

export type Company = {
  name: string;
  category: string;
  href: string;
  imageUrl: string;
  imageFit: string;
  logos: string[];
};

function CompanyCard({ company }: { company: Company }) {
  const body = (
    <>
      <div className={`company-photo${company.imageFit === "contain" ? " company-photo--contain" : ""}`}>
        {company.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.imageUrl} alt="" loading="lazy" />
        ) : (
          <span className="company-photo-fallback" aria-hidden="true">
            {company.name.slice(0, 1)}
          </span>
        )}
        {company.href ? (
          <span className="company-open" aria-hidden="true">
            <ArrowUpRight />
          </span>
        ) : null}
      </div>
      <div className="company-info">
        <div>
          <h3>{company.name}</h3>
          {company.category ? <p>{company.category}</p> : null}
        </div>
        {company.logos.length > 0 ? (
          <div className="company-logos">
            {company.logos.slice(0, 2).map((logo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={logo} src={logo} alt="" loading="lazy" />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );

  if (!company.href) return <div className="company-card">{body}</div>;

  const external = /^https?:/i.test(company.href);
  return (
    <a
      className="company-card"
      href={company.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={`${company.name.replace(/\s+/g, " ")}${external ? " — ouvre le site dans un nouvel onglet" : ""}`}
    >
      {body}
    </a>
  );
}

export default function CompanyCarousel({ companies }: { companies: Company[] }) {
  const [perView, setPerView] = useState(3);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      setPerView(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const pages = Math.max(1, Math.ceil(companies.length / perView));
  const current = Math.min(page, pages - 1);
  const slides = Array.from({ length: pages }, (_, index) =>
    companies.slice(index * perView, index * perView + perView),
  );
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <div className="company-carousel" role="region" aria-roledescription="carrousel" aria-label="Entreprises du groupe MES">
      <div className="company-window">
        <div className="company-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((slide, index) => (
            <div
              className="company-slide"
              key={index}
              style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
              inert={index !== current}
              aria-hidden={index !== current}
            >
              {slide.map((company) => (
                <CompanyCard key={`${company.name}-${company.href}`} company={company} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {pages > 1 ? (
        <div className="carousel-footer">
          <div className="pagination-dots" role="tablist" aria-label="Pages du carrousel">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === current}
                aria-label={`Page ${index + 1} sur ${pages}`}
                className={index === current ? "active" : ""}
                onClick={() => setPage(index)}
              >
                <span />
              </button>
            ))}
          </div>
          <div className="carousel-actions">
            <span className="page-fraction" aria-live="polite">
              {pad(current + 1)}
              <i>/</i>
              {pad(pages)}
            </span>
            <button
              type="button"
              className="round-button"
              onClick={() => setPage(Math.max(0, current - 1))}
              disabled={current === 0}
              aria-label="Précédent"
            >
              <ArrowLeft width={18} height={18} />
            </button>
            <button
              type="button"
              className="round-button"
              onClick={() => setPage(Math.min(pages - 1, current + 1))}
              disabled={current === pages - 1}
              aria-label="Suivant"
            >
              <ArrowRight width={18} height={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
