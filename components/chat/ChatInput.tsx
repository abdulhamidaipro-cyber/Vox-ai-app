"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, ArrowUp } from "lucide-react";
import { useChatStore } from "@/lib/stores/chatStore";
import { isInstagramUrl } from "@/lib/utils/detect-input";
import { VoiceRecorder } from "./VoiceRecorder";

export function ChatInput() {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = useChatStore((s) => s.isLoading);
  const sendReel = useChatStore((s) => s.sendReel);
  const sendVoice = useChatStore((s) => s.sendVoice);
  const sendTextHint = useChatStore((s) => s.sendTextHint);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [text]);

  const canSend = text.trim().length > 0 && !isLoading;

  function handleSend() {
    const value = text.trim();
    if (!value || isLoading) return;
    setText("");
    if (isInstagramUrl(value)) {
      sendReel(value);
    } else {
      sendTextHint(value);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (recording) {
    return (
      <div className="px-6 pb-6 pt-3">
        <div className="mx-auto max-w-3xl">
          <VoiceRecorder
            onCancel={() => setRecording(false)}
            onComplete={(blob, durationMs) => {
              setRecording(false);
              sendVoice(blob, durationMs);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 pt-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-3xl border border-border bg-surface focus-within:border-border-strong transition-colors">
          <button
            type="button"
            onClick={() => setRecording(true)}
            disabled={isLoading}
            aria-label="تسجيل رسالة صوتية"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-fg-muted hover:text-accent hover:bg-surface-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed me-1 ms-2 mb-1"
          >
            <Mic size={18} strokeWidth={1.5} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="الصق رابط ريل، أو سجّل صوتك…"
            rows={1}
            dir="auto"
            className="flex-1 resize-none bg-transparent py-3.5 text-[15px] leading-6 text-fg placeholder:text-fg-faint focus:outline-none disabled:opacity-50 max-h-[200px]"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="إرسال"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all ms-1 me-2 mb-1.5 ${
              canSend
                ? "bg-fg text-bg hover:bg-accent"
                : "bg-surface-2 text-fg-faint"
            }`}
          >
            <ArrowUp size={16} strokeWidth={2.2} />
          </button>
        </div>
        <p className="mt-2 px-3 text-[11px] text-fg-faint text-center">
          الإدخال يكتشف الرابط تلقائياً • Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  );
}
