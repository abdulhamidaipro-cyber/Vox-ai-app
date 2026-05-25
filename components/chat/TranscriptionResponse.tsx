"use client";

import { useState } from "react";
import { Copy, Check, AudioLines } from "lucide-react";
import { toast } from "sonner";
import type { BotMessage } from "@/lib/types";

export function TranscriptionResponse({ message }: { message: BotMessage }) {
  const [copied, setCopied] = useState(false);

  if (!message.text) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text!);
      setCopied(true);
      toast.success("تم النسخ.");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("تعذّر النسخ.");
    }
  };

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%]">
        <div className="mb-2 flex items-center gap-2 text-xs text-fg-muted">
          <AudioLines size={12} strokeWidth={1.5} />
          <span>التفريغ</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-5 py-4">
          <p className="text-base leading-loose text-fg whitespace-pre-wrap">
            {message.text}
          </p>
          <div className="mt-3 flex justify-start">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors"
            >
              {copied ? (
                <>
                  <Check size={12} strokeWidth={1.5} />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy size={12} strokeWidth={1.5} />
                  <span>نسخ النص</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
