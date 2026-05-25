"use client";

import { AlertCircle, RotateCw } from "lucide-react";
import type { BotMessage } from "@/lib/types";
import { useChatStore } from "@/lib/stores/chatStore";

export function ErrorBubble({ message }: { message: BotMessage }) {
  const retry = useChatStore((s) => s.retry);

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%]">
        <div className="rounded-2xl border border-border bg-surface px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <AlertCircle
              size={14}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-accent"
            />
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-fg">
                {message.text}
              </p>
              {message.pairedRequestId && (
                <button
                  type="button"
                  onClick={() => retry(message.pairedRequestId!)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-accent transition-colors"
                >
                  <RotateCw size={11} strokeWidth={1.5} />
                  <span>إعادة المحاولة</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
