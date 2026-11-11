/* eslint-disable @next/next/no-img-element */
import type { ContentBlock, Site } from "@/db/schema";
import { items, lines, paragraphs, str } from "@/lib/blocks";
import ContactForm from "./ContactForm";
import StatusCard from "./StatusCard";
import { OpeningStrip, PortraitFrame } from "./LiveStatus";
import CompanyCarousel, { type Company } from "./CompanyCarousel";
import AlbumGallery from "./AlbumGallery";
import ContactHub from "./ContactHub";
import { ArrowRight } from "./Icons";

type BlockProps = {
  block: ContentBlock;
  link: (href: string) => string;
  site: Site;
  pageSlug: string;
  primaryHeading?: boolean;
};

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <div className="section-head">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="h2">{title}</h2> : null}
      {subtitle ? (
        <p className="lead" style={{ marginTop: "0.85rem" }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

const initialsOf = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "•";

function Chapter({
  number,
  title,
  subtitle,
  primary = false,
}: {
  number?: string;
  title?: string;
  subtitle?: string;
  primary?: boolean;
}) {
  if (!title && !subtitle) return null;
  const Heading = primary ? "h1" : "h2";
  return (
    <div className="chapter-head">
      <div className="chapter-heading">
        {number ? (
          <span className="chapter-number">
            {number}
            <i aria-hidden="true" />
          </span>
        ) : null}
        <Heading>{title}</Heading>
        <span className="chapter-rule" aria-hidden="true" />
      </div>
      {subtitle ? <p className="chapter-sub">{subtitle}</p> : null}
    </div>
  );
}

function Block({ block, link, site, pageSlug, primaryHeading = false }: BlockProps) {
  const d = block.data ?? {};

  switch (block.type) {
    case "hero": {
      const image = str(d, "imageUrl") || site.heroImageUrl;
      const primary = str(d, "primaryLabel");
      const secondary = str(d, "secondaryLabel");
      const badges = lines(d, "badges");
      return (
        <section className="hero">
          <div className="wrap hero-inner">
            <div className="reveal">
              {str(d, "eyebrow") ? <p className="eyebrow">{str(d, "eyebrow")}</p> : null}
              <h1 className="hero-title">{str(d, "title")}</h1>
              {str(d, "subtitle") ? <p className="hero-sub">{str(d, "subtitle")}</p> : null}
              {primary || secondary ? (
                <div className="hero-actions">
                  {primary ? (
                    <a href={link(str(d, "primaryHref"))} className="btn btn-primary">
                      {primary} <span aria-hidden="true">→</span>
                    </a>
                  ) : null}
                  {secondary ? (
                    <a href={link(str(d, "secondaryHref"))} className="btn btn-ghost">
                      {secondary}
                    </a>
                  ) : null}
                </div>
              ) : null}
              {badges.length > 0 ? (
                <ul className="hero-badges">
                  {badges.map((badge) => (
                    <li key={badge}>{badge}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="hero-media reveal">
              {image ? (
                <img src={image} alt={str(d, "imageAlt") || str(d, "title")} loading="eager" />
              ) : (
                <div className="hero-panel" aria-hidden="true">
                  <span>{site.logoMark}</span>
                </div>
              )}
              {site.contactPhone ? (
                <div className="hero-note">
                  <strong>{site.contactPhone}</strong>
                  {site.openingHours || "Nous appeler directement"}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    case "homeHero": {
      const portrait = str(d, "portraitUrl") || site.photoUrl;
      const name = str(d, "signatureName") || site.photoName || site.name;
      const logo = str(d, "logoUrl");
      const primary = str(d, "primaryLabel");
      const secondary = str(d, "secondaryLabel");
      const anchor = str(d, "anchor");
      return (
        <section className="home-hero" id={anchor || undefined}>
          <div className="wrap">
            <div className="home-inner">
              <div className="home-copy reveal">
                {str(d, "eyebrow") ? (
                  <p className="page-eyebrow">
                    <span aria-hidden="true" />
                    {str(d, "eyebrow")}
                  </p>
                ) : null}
                <h1 className="home-title">
                  <span>{str(d, "title")}</span>
                  {str(d, "accent") ? <span className="role-second-line">{str(d, "accent")}</span> : null}
                </h1>
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="home-logo" src={logo} alt={str(d, "logoAlt")} />
                ) : null}
                {primary || secondary ? (
                  <div className="home-buttons">
                    {primary ? (
                      <a className="btn btn-primary" href={link(str(d, "primaryHref"))}>
                        {primary} <ArrowRight width={16} height={16} />
                      </a>
                    ) : null}
                    {secondary ? (
                      <a className="home-about-link" href={link(str(d, "secondaryHref"))}>
                        {secondary} <ArrowRight width={16} height={16} />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <PortraitFrame
                portraitUrl={portrait}
                portraitAlt={str(d, "portraitAlt") || site.photoAlt}
                name={name}
                sideLabel={str(d, "sideLabel")}
                initials={initialsOf(name)}
                schedule={site.schedule}
                override={site.statusOverride}
                openNote={site.statusNoteOpen}
                closedNote={site.statusNoteClosed}
              />
            </div>
            {str(d, "showHours") !== "no" ? (
              <OpeningStrip
                title={str(d, "hoursTitle") || "Horaires d’ouverture"}
                schedule={site.schedule}
                override={site.statusOverride}
                openNote={site.statusNoteOpen}
                closedNote={site.statusNoteClosed}
              />
            ) : null}
          </div>
        </section>
      );
    }

    case "aboutMe": {
      const missions = lines(d, "missions");
      const pictures = [
        { url: str(d, "image1Url"), alt: str(d, "image1Alt") },
        { url: str(d, "image2Url"), alt: str(d, "image2Alt") },
      ].filter((picture) => picture.url);
      return (
        <section className="chapter" id={str(d, "anchor") || undefined}>
          <div className="wrap">
            <Chapter primary={primaryHeading} number={str(d, "number")} title={str(d, "title")} />
            <div className={`about-layout${pictures.length === 0 ? " about-layout--solo" : ""}`}>
              <div className="about-writing">
                <div className="original-block">
                  {str(d, "introTitle") ? <h3>{str(d, "introTitle")}</h3> : null}
                  {paragraphs(str(d, "introduction")).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                {missions.length > 0 ? (
                  <div className="missions-block">
                    {str(d, "missionsTitle") ? <h3>{str(d, "missionsTitle")}</h3> : null}
                    <ul>
                      {missions.map((mission, index) => (
                        <li key={index}>
                          <span className="mission-marker">{String(index + 1).padStart(2, "0")}</span>
                          {mission}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              {pictures.length > 0 ? (
                <div className="about-pictures">
                  {pictures.map((picture) => (
                    <figure className="about-image" key={picture.url}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={picture.url} alt={picture.alt} loading="lazy" />
                    </figure>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    case "activities": {
      const list = items(d);
      return (
        <section className="chapter chapter--tint" id={str(d, "anchor") || undefined}>
          <div className="wrap">
            <Chapter primary={primaryHeading} number={str(d, "number")} title={str(d, "title")} subtitle={str(d, "subtitle")} />
            <div className="activity-grid">
              {list.map((entry, index) => {
                const bullets = lines(entry, "bullets");
                return (
                  <article className="activity-card" key={`${entry.title}-${index}`}>
                    <div className="activity-photo">
                      {entry.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.imageUrl} alt="" loading="lazy" />
                      ) : null}
                      <span className="cover-gradient" aria-hidden="true" />
                      {entry.kicker ? <span className="activity-kicker">{entry.kicker}</span> : null}
                    </div>
                    <div className="activity-body">
                      <h3>{entry.title}</h3>
                      <p>{entry.description}</p>
                      {bullets.length > 0 ? (
                        <ul className="bullet-list">
                          {bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                      {entry.href ? (
                        <a className="activity-link" href={link(entry.href)}>
                          {entry.linkLabel || "En savoir plus"} <ArrowRight width={16} height={16} />
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    case "companies": {
      const companies: Company[] = items(d).map((entry) => ({
        name: entry.name ?? "",
        category: entry.category ?? "",
        href: entry.href ? link(entry.href) : "",
        imageUrl: entry.imageUrl ?? "",
        imageFit: entry.imageFit === "contain" ? "contain" : "cover",
        logos: [entry.logo1, entry.logo2].filter((logo): logo is string => Boolean(logo)),
      }));
      return (
        <section className="chapter chapter--companies" id={str(d, "anchor") || undefined}>
          <div className="wrap">
            <Chapter primary={primaryHeading} number={str(d, "number")} title={str(d, "title")} subtitle={str(d, "subtitle")} />
            <CompanyCarousel companies={companies} />
          </div>
        </section>
      );
    }

    case "albums": {
      const tiles = items(d, "tiles").map((entry) => ({
        title: entry.title ?? "",
        imageUrl: entry.imageUrl ?? "",
        albumId: entry.albumId ?? "",
        span: entry.span === "2" ? 2 : 1,
      }));
      const albums = items(d, "albums").map((entry) => ({ id: entry.id ?? "", title: entry.title ?? "" }));
      const photos = items(d, "photos").map((entry) => ({
        albumId: entry.albumId ?? "",
        imageUrl: entry.imageUrl ?? "",
        caption: entry.caption ?? "",
        ratio: Number((entry.ratio ?? "").replace(",", ".")) || 1.33,
      }));
      return (
        <section className="chapter chapter--gallery" id={str(d, "anchor") || undefined}>
          <div className="wrap">
            <Chapter primary={primaryHeading} number={str(d, "number")} title={str(d, "title")} subtitle={str(d, "subtitle")} />
            <AlbumGallery tiles={tiles} albums={albums} photos={photos} />
          </div>
        </section>
      );
    }

    case "contactHub": {
      const recipient = site.notificationEmail || site.contactEmail;
      const portrait = str(d, "portraitUrl") || site.photoUrl;
      const channels = items(d, "channels").map((entry) => ({
        kind: entry.kind ?? "web",
        title: entry.title ?? "",
        text: entry.text ?? "",
        href: entry.href ? link(entry.href) : "",
        button: entry.button ?? "",
        text2: entry.text2 ?? "",
        href2: entry.href2 ? link(entry.href2) : "",
        button2: entry.button2 ?? "",
      }));
      const contacts = items(d, "contacts").map((entry) => ({
        scope: entry.scope ?? "",
        name: entry.name ?? "",
        description: entry.description ?? "",
        email: entry.email ?? "",
        phone: entry.phone ?? "",
      }));
      const topics = items(d, "topics").map((entry) => ({
        ...entry,
        icon: entry.icon ?? "",
        title: entry.title ?? "",
        href: entry.href ? link(entry.href) : "",
      }));
      return (
        <section className="chapter chapter--contact" id={str(d, "anchor") || undefined}>
          <div className="wrap">
            <Chapter primary={primaryHeading} number={str(d, "number")} title={str(d, "title")} />
            <ContactHub
              siteId={site.id}
              pageSlug={pageSlug}
              recipient={recipient}
              siteName={site.name}
              portraitUrl={portrait}
              initials={initialsOf(site.photoName || site.name)}
              welcome={str(d, "welcome")}
              lead={str(d, "lead")}
              question={str(d, "question")}
              subject={str(d, "subject")}
              choice={str(d, "choice")}
              invitation={str(d, "invitation")}
              routingTitle={str(d, "routingTitle")}
              formIntro={str(d, "formIntro")}
              formTitle={str(d, "formTitle")}
              successMessage={str(d, "successMessage")}
              topics={topics}
              channels={channels}
              contacts={contacts}
            />
          </div>
        </section>
      );
    }

    case "statusCard": {
      const email = site.notificationEmail || site.contactEmail;
      return (
        <section className="section section--tight">
          <div className="wrap">
            <div className="status-layout">
              <div className="status-intro">
                {str(d, "eyebrow") ? <p className="eyebrow">{str(d, "eyebrow")}</p> : null}
                {str(d, "title") ? <h2 className="h2">{str(d, "title")}</h2> : null}
                {str(d, "subtitle") ? (
                  <p className="lead" style={{ marginTop: "0.9rem" }}>
                    {str(d, "subtitle")}
                  </p>
                ) : null}
                <div className="status-legend">
                  <span>
                    <i className="legend-dot legend-dot--open" aria-hidden="true" /> Vert : en
                    poste, disponible
                  </span>
                  <span>
                    <i className="legend-dot legend-dot--closed" aria-hidden="true" /> Rouge :
                    fermé / absent
                  </span>
                </div>
              </div>
              <StatusCard
                photoUrl={str(d, "photoUrl") || site.photoUrl}
                photoAlt={str(d, "photoAlt") || site.photoAlt}
                name={str(d, "photoName") || site.photoName || site.name}
                role={str(d, "photoRole") || site.photoRole || site.role}
                schedule={site.schedule}
                override={site.statusOverride}
                openNote={str(d, "openNote") || site.statusNoteOpen}
                closedNote={str(d, "closedNote") || site.statusNoteClosed}
                email={email}
                phone={site.contactPhone}
                emailLabel={str(d, "emailLabel") || "Écrire un e-mail"}
                phoneLabel={str(d, "phoneLabel") || "Appeler"}
                showSchedule={str(d, "showSchedule") !== "no"}
                streetAddress={site.address.split("\n").join(" · ")}
              />
            </div>
          </div>
        </section>
      );
    }

    case "stats": {
      const list = items(d);
      if (list.length === 0) return null;
      return (
        <section className="section">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <div className={`stats-band${str(d, "variant") === "brand" ? " stats-band--brand" : ""}`}>
              {list.map((entry, index) => (
                <div key={`${entry.label}-${index}`}>
                  <p className="stat-value">{entry.value}</p>
                  <p className="stat-label">{entry.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "features": {
      const list = items(d);
      const columns = str(d, "columns") || "3";
      return (
        <section className="section section--soft">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <div className={`grid grid-${columns === "2" || columns === "4" ? columns : "3"}`}>
              {list.map((entry, index) => (
                <article className="card" key={`${entry.title}-${index}`}>
                  {entry.icon ? (
                    <span className="card-icon" aria-hidden="true">
                      {entry.icon}
                    </span>
                  ) : null}
                  <h3 className="h3">{entry.title}</h3>
                  <p>{entry.description}</p>
                  {entry.linkLabel ? (
                    <a className="card-link" href={link(entry.linkHref || "/")}>
                      {entry.linkLabel} →
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "imageText": {
      const image = str(d, "imageUrl");
      const bullets = lines(d, "bullets");
      const position = str(d, "imagePosition") === "left" ? "left" : "right";
      return (
        <section className="section">
          <div className="wrap">
            <div className={`split${position === "left" ? " split--media-left" : ""}`}>
              <div className="split-body">
                {str(d, "eyebrow") ? <p className="eyebrow">{str(d, "eyebrow")}</p> : null}
                <h2 className="h2">{str(d, "title")}</h2>
                {str(d, "subtitle") ? (
                  <p className="lead" style={{ marginTop: "0.7rem" }}>
                    {str(d, "subtitle")}
                  </p>
                ) : null}
                {paragraphs(str(d, "body")).map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
                {bullets.length > 0 ? (
                  <ul className="bullet-list">
                    {bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {str(d, "ctaLabel") ? (
                  <p style={{ marginTop: "1.5rem" }}>
                    <a className="btn btn-primary" href={link(str(d, "ctaHref"))}>
                      {str(d, "ctaLabel")} <span aria-hidden="true">→</span>
                    </a>
                  </p>
                ) : null}
              </div>
              <div className="split-media">
                {image ? (
                  <img src={image} alt={str(d, "imageAlt") || str(d, "title")} loading="lazy" />
                ) : (
                  <div className="hero-panel" aria-hidden="true">
                    <span>{site.logoMark}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "steps": {
      const list = items(d);
      return (
        <section className="section">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <ol className="steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {list.map((entry, index) => (
                <li className="step" key={`${entry.title}-${index}`}>
                  <div>
                    <h3 className="h3">{entry.title}</h3>
                    <p>{entry.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      );
    }

    case "gallery": {
      const list = items(d);
      return (
        <section className="section section--soft">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <div className="grid grid-3">
              {list.map((entry, index) => (
                <figure className="gallery-item" key={`${entry.caption}-${index}`}>
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.caption || `Illustration ${index + 1}`}
                      loading="lazy"
                    />
                  ) : null}
                  <figcaption className="gallery-caption">
                    <strong>{entry.caption}</strong>
                    {entry.detail ? <span>{entry.detail}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "testimonials": {
      const list = items(d);
      return (
        <section className="section">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <div className="grid grid-3">
              {list.map((entry, index) => (
                <figure className="testimonial" key={`${entry.author}-${index}`}>
                  <blockquote>« {entry.quote} »</blockquote>
                  <figcaption>
                    <strong>{entry.author}</strong>
                    {entry.role}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "offers": {
      const list = items(d);
      return (
        <section className="section section--soft">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <div className="grid grid-2">
              {list.map((entry, index) => (
                <article className="offer" key={`${entry.title}-${index}`}>
                  <h3 className="h3">{entry.title}</h3>
                  {entry.price ? <span className="offer-price">{entry.price}</span> : null}
                  <p>{entry.description}</p>
                  {lines(entry, "features").length > 0 ? (
                    <ul>
                      {lines(entry, "features").map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  ) : null}
                  {entry.ctaLabel ? (
                    <a className="btn btn-ghost" href={link(entry.ctaHref || "/contact")}>
                      {entry.ctaLabel}
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "team": {
      const list = items(d);
      return (
        <section className="section">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <div className="grid grid-3">
              {list.map((entry, index) => (
                <article className="card person" key={`${entry.name}-${index}`}>
                  <div style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
                    {entry.imageUrl ? (
                      <img src={entry.imageUrl} alt={entry.name} loading="lazy" />
                    ) : (
                      <span className="person-placeholder" aria-hidden="true">
                        {(entry.name || "?").slice(0, 1)}
                      </span>
                    )}
                    <div>
                      <h3 className="h3">{entry.name}</h3>
                      <p className="person-role">{entry.role}</p>
                    </div>
                  </div>
                  <p style={{ marginTop: "0.85rem" }}>{entry.bio}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "partners": {
      const list = items(d);
      return (
        <section className="section section--soft section--tight">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <div className="partner-grid">
              {list.map((entry, index) => (
                <div className="partner" key={`${entry.name}-${index}`}>
                  {entry.name}
                  {entry.detail ? <span>{entry.detail}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "faq": {
      const list = items(d);
      return (
        <section className="section">
          <div className="wrap">
            <SectionHead
              eyebrow={str(d, "eyebrow")}
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
            />
            <div className="faq">
              {list.map((entry, index) => (
                <details key={`${entry.question}-${index}`} open={index === 0}>
                  <summary>{entry.question}</summary>
                  <p>{entry.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "prose": {
      return (
        <section className="section section--tight">
          <div className="wrap">
            <div style={{ maxWidth: "760px" }}>
              {str(d, "eyebrow") ? <p className="eyebrow">{str(d, "eyebrow")}</p> : null}
              {str(d, "title") ? <h2 className="h2">{str(d, "title")}</h2> : null}
              {paragraphs(str(d, "body")).map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  style={{ marginTop: "1rem", color: "var(--muted)", lineHeight: 1.75 }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "cta": {
      const primary = str(d, "buttonLabel");
      const secondary = str(d, "secondaryLabel");
      return (
        <section className="section section--tight">
          <div className="wrap">
            <div className="cta-band">
              <div>
                <h2>{str(d, "title")}</h2>
                {str(d, "body") ? <p>{str(d, "body")}</p> : null}
              </div>
              <div className="cta-actions">
                {primary ? (
                  <a className="btn btn-ghost" href={link(str(d, "buttonHref"))}>
                    {primary}
                  </a>
                ) : null}
                {secondary ? (
                  <a
                    className="btn"
                    href={link(str(d, "secondaryHref"))}
                    style={{ borderColor: "rgba(255,255,255,.6)", color: "#fff" }}
                  >
                    {secondary}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "contact": {
      const showForm = str(d, "showForm") !== "no";
      return (
        <section className="section section--soft" id="contact">
          <div className="wrap">
            <SectionHead
              title={str(d, "title")}
              subtitle={str(d, "subtitle")}
              eyebrow="Contact"
            />
            <div className="contact-grid">
              {showForm ? (
                <div className="contact-panel">
                  <ContactForm
                    siteId={site.id}
                    pageSlug={pageSlug}
                    formTitle={str(d, "formTitle") || "Formulaire de contact"}
                    successMessage={str(d, "successMessage")}
                    recipient={site.notificationEmail || site.contactEmail}
                    siteName={site.name}
                  />
                </div>
              ) : null}
              <div className="contact-panel">
                <h3 className="h3">Nous joindre directement</h3>
                <p className="admin-sub" style={{ marginTop: "0.3rem", color: "var(--muted)" }}>
                  Une question sur le Déchèt’Lab, un dépôt professionnel ou un dossier
                  d&apos;insertion ? Le plus rapide reste l&apos;e-mail ou le téléphone.
                </p>
                <div className="direct-actions">
                  <a
                    className="direct-action direct-action--primary"
                    href={`mailto:${site.notificationEmail || site.contactEmail}?subject=${encodeURIComponent(
                      `Question depuis le site ${site.name}`,
                    )}`}
                  >
                    <span aria-hidden="true">✉</span>
                    <span>
                      <strong>{site.notificationEmail || site.contactEmail}</strong>
                      Écrire directement
                    </span>
                  </a>
                  {site.contactPhone ? (
                    <a
                      className="direct-action"
                      href={`tel:${site.contactPhone.replace(/\s/g, "")}`}
                    >
                      <span aria-hidden="true">☎</span>
                      <span>
                        <strong>{site.contactPhone}</strong>
                        Appeler pendant les horaires
                      </span>
                    </a>
                  ) : null}
                </div>
                <ul className="contact-list">
                  {str(d, "email") ? (
                    <li>
                      <span className="contact-ico" aria-hidden="true">
                        ✉
                      </span>
                      <div>
                        <strong>E-mail</strong>
                        <a href={`mailto:${str(d, "email")}`}>{str(d, "email")}</a>
                      </div>
                    </li>
                  ) : null}
                  {str(d, "phone") ? (
                    <li>
                      <span className="contact-ico" aria-hidden="true">
                        ☎
                      </span>
                      <div>
                        <strong>Téléphone</strong>
                        <a href={`tel:${str(d, "phone").replace(/\s/g, "")}`}>{str(d, "phone")}</a>
                      </div>
                    </li>
                  ) : null}
                  {str(d, "address") ? (
                    <li>
                      <span className="contact-ico" aria-hidden="true">
                        ⌖
                      </span>
                      <div>
                        <strong>Adresse</strong>
                        <span style={{ whiteSpace: "pre-line" }}>{str(d, "address")}</span>
                      </div>
                    </li>
                  ) : null}
                  {str(d, "hours") ? (
                    <li>
                      <span className="contact-ico" aria-hidden="true">
                        ◷
                      </span>
                      <div>
                        <strong>Disponibilité</strong>
                        <span>{str(d, "hours")}</span>
                      </div>
                    </li>
                  ) : null}
                </ul>
                {str(d, "sideNote") ? <p className="note">{str(d, "sideNote")}</p> : null}
              </div>
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

export function BlockList({
  blocks,
  link,
  site,
  pageSlug,
}: {
  blocks: ContentBlock[];
  link: (href: string) => string;
  site: Site;
  pageSlug: string;
}) {
  return (
    <>
      {blocks.map((block, index) => (
        <Block
          key={block.id}
          block={block}
          primaryHeading={index === 0 && !blocks.some((entry) => entry.type === "hero" || entry.type === "homeHero")}
          link={link}
          site={site}
          pageSlug={pageSlug}
        />
      ))}
    </>
  );
}
