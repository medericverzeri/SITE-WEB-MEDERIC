"use client";

import { useId, useRef, useState } from "react";
import ContactForm from "./ContactForm";
import { ArrowRight, ArrowUpRight, ChannelIcon, Mail, Phone } from "./Icons";
import type { ContactTopic } from "@/lib/dechetlab-info";
import type { RequestContact } from "@/lib/site-content";

export type Topic = ContactTopic;
export type Channel = {
  kind: string;
  title: string;
  text: string;
  href: string;
  button: string;
  text2: string;
  href2: string;
  button2: string;
};
type Props = {
  siteId: number;
  pageSlug: string;
  recipient: string;
  siteName: string;
  portraitUrl: string;
  initials: string;
  welcome: string;
  lead: string;
  question: string;
  subject: string;
  choice: string;
  invitation: string;
  routingTitle: string;
  formIntro: string;
  formTitle: string;
  successMessage: string;
  topics: Topic[];
  channels: Channel[];
  contacts: RequestContact[];
};

const flat = (value: string) => value.replace(/\s+/g, " ").trim();

export default function ContactHub(props: Props) {
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState(() => {
    const depot = props.topics.findIndex((entry) => entry.id === "depot");
    return depot >= 0 ? depot : props.topics.findIndex((entry) => entry.body && entry.action !== "link");
  });
  const uid = useId();
  const formRef = useRef<HTMLDivElement>(null);
  const contacts = props.contacts.filter((contact) => contact.name || contact.email || contact.phone);
  const channels = contacts.length > 0 ? props.channels.filter((channel) => channel.kind === "web") : props.channels;

  const chooseTopic = (title: string) => {
    setTopic(flat(title));
    window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      formRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "center" });
      formRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus({ preventScroll: true });
    });
  };

  return (
    <div className="contact-hub">
      {contacts.length > 0 ? (
        <section className="request-contacts" aria-labelledby={`${uid}-routing-title`}>
          <h2 id={`${uid}-routing-title`}>{props.routingTitle || "Le bon contact pour votre demande"}</h2>
          <div className="request-contacts-grid">
            {contacts.map((contact, index) => (
              <article className="request-contact" key={`${contact.name}-${index}`}>
                <div className="request-contact-heading">
                  <p className="request-contact-scope">{contact.scope}</p>
                  <h3>{contact.name}</h3>
                </div>
                <p className="request-contact-description">{contact.description}</p>
                <div className="request-contact-links">
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} aria-label={`Envoyer un e-mail à ${contact.name}`}>
                      <Mail width={17} height={17} /><span>{contact.email}</span>
                    </a>
                  ) : null}
                  {contact.phone ? (
                    <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} aria-label={`Appeler ${contact.name}`}>
                      <Phone width={17} height={17} /><span>{contact.phone}</span>
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <div className="contact-layout">
      <aside className="contact-intro">
        <div className="contact-avatar">
          {props.portraitUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={props.portraitUrl} alt="" />
          ) : (
            <span aria-hidden="true">{props.initials}</span>
          )}
        </div>
        {props.welcome ? <p className="contact-welcome">{props.welcome}</p> : null}
        {props.lead ? <h3>{props.lead}</h3> : null}
      </aside>

      <div className="contact-main">
        {props.question || props.subject ? (
          <p className="contact-question">
            {props.question ? <span>{props.question}</span> : null}
            {props.subject ? <strong>{props.subject}</strong> : null}
          </p>
        ) : null}

        {props.topics.length > 0 ? (
          <div className="contact-resources">
            <p className="contact-resources-label">Vos informations pratiques, en un clic</p>
            <div className="contact-topics" role="group" aria-label="Informations et démarches">
              {props.topics.map((entry, index) => {
                const hasInfo = entry.action !== "form" && Boolean(entry.body || entry.bullets || entry.notice || entry.noticeSteps || entry.price1);
                const content = (
                  <>
                    <span className="topic-icon" aria-hidden="true">{entry.icon}</span>
                    <span className="topic-label">{entry.title}</span>
                  </>
                );
                if (entry.action === "link" && entry.href) {
                  const external = /^https?:/i.test(entry.href);
                  return (
                    <a
                      className="topic-shortcut"
                      key={`${entry.id || index}-link`}
                      href={entry.href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {content}
                      <ArrowUpRight className="topic-external" width={13} height={13} />
                      {external ? <span className="sr-only"> — ouvre le site officiel dans un nouvel onglet</span> : null}
                    </a>
                  );
                }
                return (
                  <button
                    key={entry.id || index}
                    id={`${uid}-topic-${index}`}
                    type="button"
                    aria-expanded={hasInfo ? selected === index : undefined}
                    aria-controls={hasInfo ? `${uid}-panel-${index}` : undefined}
                    data-active={hasInfo && selected === index}
                    onClick={() => hasInfo ? setSelected(index) : chooseTopic(entry.title)}
                  >
                    {content}
                  </button>
                );
              })}
            </div>

            {props.topics.map((entry, index) => {
              if (entry.action === "link" || entry.action === "form" || !(entry.body || entry.bullets || entry.notice || entry.noticeSteps || entry.price1)) return null;
              const steps = (entry.bullets || "").split("\n").map((line) => line.trim()).filter(Boolean);
              const prices = [
                { label: entry.price1Label, value: entry.price1 },
                { label: entry.price2Label, value: entry.price2 },
              ].filter((price) => price.value);
              return (
                <section
                  key={`panel-${entry.id || index}`}
                  className="topic-panel"
                  id={`${uid}-panel-${index}`}
                  aria-labelledby={`${uid}-topic-${index}`}
                  hidden={selected !== index}
                >
                  <div className="topic-panel-heading">
                    <span className="topic-panel-icon" aria-hidden="true">{entry.icon}</span>
                    <div>
                      <span className="topic-panel-kicker">Déchèt’Lab · Informations pratiques</span>
                      <h3>{flat(entry.title)}</h3>
                    </div>
                  </div>
                  {(entry.body || "").split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => (
                    <p className="topic-panel-copy" key={i}>{paragraph}</p>
                  ))}
                  {steps.length > 0 ? (
                    <ul className="topic-checklist">
                      {steps.map((step, i) => (
                        <li key={i}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><p>{step}</p></li>
                      ))}
                    </ul>
                  ) : null}
                  {prices.length > 0 ? (
                    <dl className="topic-prices">
                      {prices.map((price, i) => (
                        <div key={i}>
                          <dt>{price.label}</dt>
                          <dd>{price.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {entry.notice || entry.noticeSteps ? (
                    <div className="topic-notice">
                      <span className="topic-notice-symbol" aria-hidden="true">!</span>
                      <div>
                        {entry.noticeTitle ? <strong>{entry.noticeTitle}</strong> : null}
                        {entry.notice ? <p>{entry.notice}</p> : null}
                        {entry.noticeSteps ? (
                          <ol className="topic-notice-steps">
                            {entry.noticeSteps.split("\n").map((step) => step.trim()).filter(Boolean).map((step, i) => {
                              const separator = step.indexOf(":");
                              return (
                                <li key={i}>
                                  {separator > 0 ? (
                                    <><strong>{step.slice(0, separator)} :</strong>{" "}{step.slice(separator + 1).trim()}</>
                                  ) : step}
                                </li>
                              );
                            })}
                          </ol>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div className="topic-panel-actions">
                    {entry.href ? (
                      <a
                        href={entry.href}
                        className="topic-primary-link"
                        {...(/^https?:/i.test(entry.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {entry.linkLabel || "En savoir plus"}<ArrowUpRight width={16} height={16} />
                      </a>
                    ) : null}
                    <button type="button" className="topic-question-link" onClick={() => chooseTopic(entry.title)}>
                      Une question sur ce sujet ?<ArrowRight width={15} height={15} />
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        ) : null}

        {props.invitation || props.choice ? (
          <div className="contact-invitation">
            {props.invitation ? <h3>{props.invitation}</h3> : null}
            {props.choice ? <p>{props.choice}</p> : null}
          </div>
        ) : null}

        {channels.length > 0 ? (
          <div className={`contact-channels${channels.length === 1 ? " contact-channels--single" : ""}`}>
            {channels.map((channel) => (
              <div className="channel-card" key={`${channel.kind}-${channel.title}`}>
                <span className="channel-icon">
                  <ChannelIcon kind={channel.kind} />
                </span>
                <h4>{channel.title}</h4>
                <p>{channel.text}</p>
                {channel.href ? (
                  <a
                    className="channel-button"
                    href={channel.href}
                    {...(/^https?:/i.test(channel.href)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {channel.button || "Ouvrir"}
                    <ArrowRight />
                  </a>
                ) : null}
                {channel.href2 ? (
                  <a className="channel-button channel-button--alt" href={channel.href2}>
                    <span>{channel.text2}</span>
                    <b>
                      {channel.button2 || "Ouvrir"}
                      <ArrowRight />
                    </b>
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div ref={formRef} className="contact-form-wrap" id="formulaire-contact">
          {props.formIntro ? <p className="contact-form-intro">{props.formIntro}</p> : null}
          <ContactForm
            siteId={props.siteId}
            pageSlug={props.pageSlug}
            formTitle={props.formTitle || "Écrivez-nous"}
            successMessage={props.successMessage}
            recipient={props.recipient}
            siteName={props.siteName}
            presetSubject={topic ? `Question : ${topic}` : ""}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
