"use client";

import { useState } from "react";

export default function MeaningHint({
  children,
  meaning
}: {
  children: React.ReactNode;
  meaning: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="meaningHintWrap">
      <button
        type="button"
        className="meaningHintTrigger"
        aria-label={`Show meaning: ${meaning}`}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </button>
      <span
        className={`meaningTooltip ${open ? "isOpen" : ""}`}
        role="tooltip"
      >
        <span className="meaningTooltipLabel">Meaning</span>
        <strong>{meaning}</strong>
      </span>
    </span>
  );
}
