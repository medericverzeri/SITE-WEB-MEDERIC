"use client";

import { useActionState, useEffect, useState } from "react";
import { submitContactAction, type ContactState } from "@/app/actions";

const initialState: ContactState = { status: "idle", message: "" };

type Props = {
  siteId: number;
  pageSlug: string;
  formTitle: string;
  submitLabel?: string;
  successMessage?: string;
  recipient?: string;
  siteName?: string;
  presetSubject?: string;
};

export default function ContactForm({
  siteId,
  pageSlug,
  formTitle,
  submitLabel = "Envoyer mon message",
  successMessage,
  recipient,
  siteName,
  presetSubject = "",
}: Props) {
  const [state, formAction, pending] = useActionState(submitContactAction, initialState);
  const [subject, setSubject] = useState(presetSubject);

  useEffect(() => {
    if (presetSubject) setSubject(presetSubject);
  }, [presetSubject]);

  return (
    <form action={formAction} noValidate>
      <h3 className="h3" style={{ marginBottom: "0.9rem" }}>
        {formTitle}
      </h3>
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="pageSlug" value={pageSlug} />
      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor="societe-website">Site internet</label>
        <input id="societe-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="contact-name">Votre nom *</label>
          <input id="contact-name" name="name" className="input" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Votre e-mail *</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className="input"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="contact-phone">Téléphone</label>
          <input id="contact-phone" name="phone" className="input" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="contact-organisation">Structure / entreprise</label>
          <input id="contact-organisation" name="organisation" className="input" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="contact-subject">Objet</label>
        <input
          id="contact-subject"
          name="subject"
          className="input"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="contact-body">Votre message *</label>
        <textarea
          id="contact-body"
          name="body"
          className="textarea"
          required
          placeholder="Décrivez votre demande en quelques lignes…"
        />
        <span className="hint">
          Les champs marqués * sont obligatoires. Votre demande est enregistrée et transmise à
          l&apos;équipe{recipient ? ` (${recipient})` : ""}.
        </span>
      </div>

      {state.status === "success" ? (
        <div className="form-success" role="status">
          <strong>{successMessage || state.message}</strong>
          <p style={{ marginTop: "0.45rem", fontSize: "0.86rem" }}>
            {state.emailSent
              ? `Un courriel vient d'être envoyé à ${state.recipient}.`
              : "Votre demande est enregistrée dans notre espace de gestion."}
            {state.mailtoHref ? (
              <>
                {" "}
                Pour garder une copie dans votre boîte mail,{" "}
                <a href={state.mailtoHref} style={{ fontWeight: 700 }}>
                  envoyez-la aussi directement
                </a>
                .
              </>
            ) : null}
          </p>
        </div>
      ) : null}
      {state.status === "error" ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={pending}
        style={{ marginTop: "0.9rem" }}
      >
        {pending ? "Envoi en cours…" : submitLabel}
      </button>
      {recipient ? (
        <p className="hint" style={{ marginTop: "0.6rem" }}>
          Vous préférez votre messagerie ? Écrivez à{" "}
          <a href={`mailto:${recipient}?subject=${encodeURIComponent(`Question — ${siteName ?? "site"}`)}`}>
            {recipient}
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}
