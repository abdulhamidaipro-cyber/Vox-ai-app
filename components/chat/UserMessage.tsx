"use client";

import { Mic, Link as LinkIcon } from "lucide-react";
import type { UserMessage as UserMessageType } from "@/lib/types";
import { formatDuration } from "@/lib/utils/format";

export function UserMessage({ message }: { message: UserMessageType }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        {message.kind === "reel-request" && (
          <div className="rounded-2xl rounded-tr-md bg-user-bubble px-4 py-3 border border-border">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-fg-muted">
              <LinkIcon size={11} strokeWidth={1.5} />
              <span>رابط ريل</span>
            </div>
            <code
              dir="ltr"
              className="font-mono text-xs text-fg break-all block leading-relaxed"
            >
              {message.text}
            </code>
          </div>
        )}

        {message.kind === "voice-request" && (
          <div className="rounded-2xl rounded-tr-md bg-user-bubble px-4 py-3 border border-border flex items-center gap-3 min-w-[180px]">
            <div className="flex-1 flex items-center gap-2 text-fg-muted">
              <Mic size={14} strokeWidth={1.5} />
              <span className="text-xs">رسالة صوتية</span>
            </div>
            {message.audioDurationMs !== undefined && (
              <span
                dir="ltr"
                className="font-mono text-xs text-fg-muted tabular-nums"
              >
                {formatDuration(message.audioDurationMs)}
              </span>
            )}
          </div>
        )}

        {message.kind === "text-hint" && (
          <div className="rounded-2xl rounded-tr-md bg-user-bubble px-4 py-3 border border-border">
            <p className="text-sm text-fg-muted leading-relaxed">
              {message.text}
            </p>
          </div>
        )}

        {message.audioBlobUrl && (
          <audio
            src={message.audioBlobUrl}
            controls
            className="mt-2 h-9 w-full max-w-[280px] opacity-80"
          />
        )}
      </div>
    </div>
  );
}
