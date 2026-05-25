"use client";

import { Download, Film } from "lucide-react";
import type { BotMessage } from "@/lib/types";

export function ReelResponse({ message }: { message: BotMessage }) {
  if (!message.videoBlobUrl) return null;

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] w-full">
        <div className="mb-2 flex items-center gap-2 text-xs text-fg-muted">
          <Film size={12} strokeWidth={1.5} />
          <span>الريل</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <video
            src={message.videoBlobUrl}
            controls
            playsInline
            className="block w-full max-h-[480px] bg-black"
          />
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
            <span className="text-xs text-fg-muted">جاهز للحفظ</span>
            <a
              href={message.videoBlobUrl}
              download={`reel-${message.id}.mp4`}
              className="inline-flex items-center gap-1.5 text-xs text-fg hover:text-accent transition-colors link-editorial"
            >
              <Download size={12} strokeWidth={1.5} />
              <span>تحميل</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
