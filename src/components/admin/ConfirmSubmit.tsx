"use client";

import type { ReactNode } from "react";

export default function ConfirmSubmit({
  message,
  className = "a-btn a-btn--danger a-btn--sm",
  children,
  title,
  name,
  value,
}: {
  message: string;
  className?: string;
  children: ReactNode;
  title?: string;
  name?: string;
  value?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      title={title}
      name={name}
      value={value}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
