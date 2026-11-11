"use client";

import { useEffect, useState } from "react";

type Mode = "normal" | "large" | "contrast";

const STORAGE_KEY = "horizon-reading";

export default function ReadingComfort() {
  const [mode, setMode] = useState<Mode>("normal");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "large" || stored === "contrast") setMode(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "normal") {
      delete root.dataset.reading;
    } else {
      root.dataset.reading = mode;
    }
    if (mode !== "normal") window.localStorage.setItem(STORAGE_KEY, mode);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [mode]);

  return (
    <div className="reading-toggle" role="group" aria-label="Confort de lecture">
      <button
        type="button"
        onClick={() => setMode(mode === "large" ? "normal" : "large")}
        aria-pressed={mode === "large"}
        title="Agrandir le texte"
      >
        A+
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "contrast" ? "normal" : "contrast")}
        aria-pressed={mode === "contrast"}
        title="Contraste renforcé"
      >
        Contraste
      </button>
    </div>
  );
}
