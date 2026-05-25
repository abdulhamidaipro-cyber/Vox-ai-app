"use client";

import { Film, AudioLines } from "lucide-react";

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-surface/40 px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] text-fg-muted">
        {icon}
        <span>{label}</span>
      </div>
      <span
        dir="ltr"
        className="font-latin text-2xl font-light text-fg tabular-nums"
      >
        {value}
      </span>
    </div>
  );
}

export function StatsRow({
  reels,
  transcriptions,
}: {
  reels: number;
  transcriptions: number;
}) {
  return (
    <div className="flex gap-2">
      <Stat
        icon={<Film size={11} strokeWidth={1.5} />}
        label="ريلز"
        value={reels}
      />
      <Stat
        icon={<AudioLines size={11} strokeWidth={1.5} />}
        label="تفريغ"
        value={transcriptions}
      />
    </div>
  );
}
