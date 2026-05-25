"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/stores/chatStore";
import { UserMessage } from "./UserMessage";
import { ReelResponse } from "./ReelResponse";
import { TranscriptionResponse } from "./TranscriptionResponse";
import { LoadingBubble } from "./LoadingBubble";
import { ErrorBubble } from "./ErrorBubble";
import { EmptyState } from "./EmptyState";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {messages.map((m) => {
          if (m.role === "user") return <UserMessage key={m.id} message={m} />;
          if (m.role === "loading")
            return <LoadingBubble key={m.id} kind={m.kind} />;
          if (m.kind === "reel") return <ReelResponse key={m.id} message={m} />;
          if (m.kind === "transcription")
            return <TranscriptionResponse key={m.id} message={m} />;
          if (m.kind === "error") return <ErrorBubble key={m.id} message={m} />;
          return null;
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
