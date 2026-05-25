import { Film, AudioLines } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md">
        <div
          dir="ltr"
          className="mb-6 inline-flex items-baseline gap-1 font-latin"
        >
          <span className="text-5xl font-semibold tracking-tight text-fg">
            Vox
          </span>
          <span className="text-3xl font-mono text-accent">AI</span>
        </div>

        <h1 className="mb-3 text-2xl font-medium leading-snug text-fg text-balance">
          حمّل الريلز.
          <br />
          فرّغ الصوت.
          <br />
          <span className="text-fg-muted">تطوّر مع كل مرة.</span>
        </h1>

        <p className="mb-10 text-sm leading-7 text-fg-muted text-balance">
          الصق رابط ريل من إنستقرام، أو اضغط زرّ المايك وتكلّم.
          التطبيق يفهم وش تبي ويسوي اللازم.
        </p>

        <div className="grid gap-3 text-start">
          <div className="rounded-lg border border-border bg-surface/40 px-4 py-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-fg-muted">
              <Film size={12} strokeWidth={1.5} />
              <span>مثال</span>
            </div>
            <code
              dir="ltr"
              className="font-mono text-xs text-fg-muted block truncate"
            >
              https://www.instagram.com/reel/...
            </code>
          </div>
          <div className="rounded-lg border border-border bg-surface/40 px-4 py-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-fg-muted">
              <AudioLines size={12} strokeWidth={1.5} />
              <span>أو</span>
            </div>
            <span className="text-xs text-fg-muted">
              اضغط على المايك واتكلّم لتحويل صوتك إلى نص.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
