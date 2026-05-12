import React from "react";

export default function AlertMessage({ message, type = "error" }) {
  if (!message) return null;

  const baseClasses = "p-3 text-sm font-medium rounded-md border";
  const typeClasses =
    type === "success"
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : "text-destructive bg-destructive/10 border-destructive/20";

  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
}
