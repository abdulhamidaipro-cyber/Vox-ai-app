"use client";

import { create } from "zustand";
import { toast } from "sonner";
import type { ChatMessage, UserMessage, BotMessage } from "@/lib/types";
import { randomId } from "@/lib/utils/format";
import { useGameStore } from "./gameStore";

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;

  sendReel: (url: string) => Promise<void>;
  sendVoice: (blob: Blob, durationMs: number) => Promise<void>;
  sendTextHint: (text: string) => void;
  retry: (pairedRequestId: string) => Promise<void>;
  clear: () => void;
}

function appendUser(msg: UserMessage) {
  return (state: ChatStore) => ({ messages: [...state.messages, msg] });
}

function appendBot(msg: BotMessage) {
  return (state: ChatStore) => ({
    messages: [...state.messages.filter((m) => m.role !== "loading"), msg],
    isLoading: false,
  });
}

function appendLoading(kind: "reel" | "voice") {
  return (state: ChatStore) => ({
    messages: [
      ...state.messages,
      { id: randomId(), role: "loading" as const, kind, createdAt: Date.now() },
    ],
    isLoading: true,
  });
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  messages: [],
  isLoading: false,

  sendReel: async (url) => {
    const reqId = randomId();
    set(
      appendUser({
        id: reqId,
        role: "user",
        kind: "reel-request",
        text: url,
        createdAt: Date.now(),
      }),
    );
    set(appendLoading("reel"));

    try {
      const res = await fetch("/api/instagram-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (!res.ok || contentType.includes("application/json")) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        const errorText =
          data?.error ??
          "تعذّر تحميل الريل. الخدمة قد تكون متوقّفة مؤقتاً.";
        set(
          appendBot({
            id: randomId(),
            role: "bot",
            kind: "error",
            text: errorText,
            pairedRequestId: reqId,
            createdAt: Date.now(),
          }),
        );
        return;
      }

      const blob = await res.blob();
      const videoUrl = URL.createObjectURL(blob);
      set(
        appendBot({
          id: randomId(),
          role: "bot",
          kind: "reel",
          videoBlobUrl: videoUrl,
          pairedRequestId: reqId,
          createdAt: Date.now(),
        }),
      );
      useGameStore.getState().recordSuccess("reel");
    } catch (e) {
      set(
        appendBot({
          id: randomId(),
          role: "bot",
          kind: "error",
          text: "خطأ في الاتصال. حاول مرة ثانية.",
          pairedRequestId: reqId,
          createdAt: Date.now(),
        }),
      );
    }
  },

  sendVoice: async (blob, durationMs) => {
    const reqId = randomId();
    const audioUrl = URL.createObjectURL(blob);
    set(
      appendUser({
        id: reqId,
        role: "user",
        kind: "voice-request",
        audioBlobUrl: audioUrl,
        audioDurationMs: durationMs,
        createdAt: Date.now(),
      }),
    );
    set(appendLoading("voice"));

    try {
      const form = new FormData();
      // The webhook expects the file under field name "data"
      // (see n8n/reels-voice-app.md). The browser auto-sets the
      // correct Content-Type per part from the Blob's type.
      form.append("data", blob, "voice.webm");

      const res = await fetch("/api/transcribe-voice", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        set(
          appendBot({
            id: randomId(),
            role: "bot",
            kind: "error",
            text: data?.error ?? "تعذّر تفريغ الصوت.",
            pairedRequestId: reqId,
            createdAt: Date.now(),
          }),
        );
        return;
      }

      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      const isEmpty =
        !text || /no speech|silence/i.test(text);

      set(
        appendBot({
          id: randomId(),
          role: "bot",
          kind: "transcription",
          text: isEmpty
            ? "ما لقيت كلام واضح في الرسالة الصوتية."
            : text,
          pairedRequestId: reqId,
          createdAt: Date.now(),
        }),
      );
      if (!isEmpty) {
        useGameStore.getState().recordSuccess("transcription");
      }
    } catch (e) {
      set(
        appendBot({
          id: randomId(),
          role: "bot",
          kind: "error",
          text: "خطأ في الاتصال. حاول مرة ثانية.",
          pairedRequestId: reqId,
          createdAt: Date.now(),
        }),
      );
    }
  },

  sendTextHint: (text) => {
    // Don't waste an API call — just surface a hint in chat
    set(
      appendUser({
        id: randomId(),
        role: "user",
        kind: "text-hint",
        text,
        createdAt: Date.now(),
      }),
    );
    toast.info("الصق رابط ريل، أو سجّل رسالة صوتية بزرّ المايك.");
  },

  retry: async (pairedRequestId) => {
    const original = get().messages.find(
      (m) => m.role === "user" && m.id === pairedRequestId,
    ) as UserMessage | undefined;
    if (!original) return;
    if (original.kind === "reel-request" && original.text) {
      await get().sendReel(original.text);
    }
  },

  clear: () => {
    // Revoke any object URLs before clearing
    for (const m of get().messages) {
      if (m.role === "user" && m.audioBlobUrl) URL.revokeObjectURL(m.audioBlobUrl);
      if (m.role === "bot" && m.videoBlobUrl) URL.revokeObjectURL(m.videoBlobUrl);
    }
    set({ messages: [], isLoading: false });
  },
}));
