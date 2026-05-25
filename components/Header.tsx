"use client";

import { useGameStore } from "@/lib/stores/gameStore";
import { Trash2 } from "lucide-react";
import { useChatStore } from "@/lib/stores/chatStore";

export function Header() {
  const messages = useChatStore((s) => s.messages);
  const clear = useChatStore((s) => s.clear);
  const hasMessages = messages.length > 0;

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div dir="ltr" className="flex items-baseline gap-1.5 font-latin">
        <span className="text-xl font-semibold tracking-tight text-fg">
          Vox
        </span>
        <span className="text-sm font-mono text-accent">AI</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-xs text-fg-muted">
          حمّل، فرّغ، تطوّر
        </span>
        {hasMessages && (
          <button
            type="button"
            onClick={clear}
            aria-label="مسح المحادثة"
            className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors"
          >
            <Trash2 size={12} strokeWidth={1.5} />
            <span>مسح</span>
          </button>
        )}
      </div>
    </header>
  );
}
