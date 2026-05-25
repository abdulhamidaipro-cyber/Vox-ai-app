"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { formatDuration } from "@/lib/utils/format";

interface VoiceRecorderProps {
  onCancel: () => void;
  onComplete: (blob: Blob, durationMs: number) => void;
}

export function VoiceRecorder({ onCancel, onComplete }: VoiceRecorderProps) {
  const [durationMs, setDurationMs] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(24).fill(0.05));
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const tickerRef = useRef<number | null>(null);

  // Start recording on mount
  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        // Audio analyser for waveform
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;

        const bufferLen = analyser.frequencyBinCount;
        const data = new Uint8Array(bufferLen);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const next: number[] = [];
          const bucketSize = Math.floor(bufferLen / 24);
          for (let i = 0; i < 24; i++) {
            let sum = 0;
            for (let j = 0; j < bucketSize; j++) {
              sum += data[i * bucketSize + j] ?? 0;
            }
            const avg = sum / bucketSize / 255;
            next.push(Math.max(0.05, avg));
          }
          setLevels(next);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        // Recorder
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
        const rec = new MediaRecorder(stream, { mimeType: mime });
        recorderRef.current = rec;
        chunksRef.current = [];
        rec.ondataavailable = (e) => {
          if (e.data && e.data.size) chunksRef.current.push(e.data);
        };
        rec.start();

        // Duration ticker
        startTimeRef.current = Date.now();
        tickerRef.current = window.setInterval(() => {
          setDurationMs(Date.now() - startTimeRef.current);
        }, 100);
      } catch (e) {
        setError("ما قدرت أوصل للمايك. تأكّد من الصلاحية.");
      }
    }

    start();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (tickerRef.current !== null) clearInterval(tickerRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    rafRef.current = null;
    tickerRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
  }

  function handleSend() {
    const rec = recorderRef.current;
    if (!rec) return;
    const finalDuration = Date.now() - startTimeRef.current;

    rec.onstop = () => {
      const mime = rec.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      cleanup();
      onComplete(blob, finalDuration);
    };
    if (rec.state !== "inactive") rec.stop();
    else {
      const blob = new Blob(chunksRef.current, {
        type: rec.mimeType || "audio/webm",
      });
      cleanup();
      onComplete(blob, finalDuration);
    }
  }

  function handleCancel() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    cleanup();
    onCancel();
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-3">
        <span className="text-sm text-fg">{error}</span>
        <button
          type="button"
          onClick={onCancel}
          className="ms-auto text-xs text-fg-muted hover:text-fg"
        >
          إغلاق
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-3 py-2">
      <button
        type="button"
        onClick={handleCancel}
        aria-label="إلغاء التسجيل"
        className="grid h-9 w-9 place-items-center rounded-full text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
      >
        <X size={16} strokeWidth={1.5} />
      </button>

      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse-rec" />
        <span
          dir="ltr"
          className="font-mono text-xs text-fg-muted tabular-nums"
        >
          {formatDuration(durationMs)}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-[2px] h-9">
        {levels.map((level, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-fg-muted transition-all duration-100"
            style={{
              height: `${Math.max(4, level * 32)}px`,
              opacity: 0.4 + level * 0.6,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleSend}
        aria-label="إرسال التسجيل"
        className="grid h-9 w-9 place-items-center rounded-full bg-accent text-bg hover:bg-accent-soft transition-colors"
      >
        <Send size={15} strokeWidth={2} />
      </button>
    </div>
  );
}
