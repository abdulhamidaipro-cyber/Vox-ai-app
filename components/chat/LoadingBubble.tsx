"use client";

export function LoadingBubble({ kind }: { kind: "reel" | "voice" }) {
  const label = kind === "reel" ? "أحمّل الريل" : "أفرّغ الصوت";
  return (
    <div className="flex justify-end">
      <div className="rounded-2xl border border-border bg-surface px-4 py-3 inline-flex items-center gap-3">
        <span className="dot-bounce">
          <span />
          <span />
          <span />
        </span>
        <span className="text-xs text-fg-muted">{label}…</span>
      </div>
    </div>
  );
}
