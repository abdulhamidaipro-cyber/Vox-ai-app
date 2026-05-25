import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 90;

const MAX_BYTES = 25 * 1024 * 1024; // 25MB cap

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_TRANSCRIBE_VOICE;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Server misconfigured: webhook URL missing." },
      { status: 500 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data with an audio file." },
      { status: 400 },
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "الملف الصوتي كبير جداً (الحد ٢٥ ميجابايت)." },
      { status: 413 },
    );
  }

  const authToken = process.env.N8N_AUTH_TOKEN;

  // NOTE: We forward the multipart body as-is. The browser's FormData
  // sets each part's Content-Type from the Blob, so Gemini receives the
  // right MIME — do NOT rebuild the FormData server-side or the MIME
  // will be lost (see n8n/reels-voice-app.md "Known constraints").
  const upstream = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: req.body,
    // @ts-expect-error - duplex is required for streaming bodies in Node 18+
    duplex: "half",
  });

  const upstreamType = upstream.headers.get("content-type") ?? "application/json";
  const payload = await upstream.text();

  return new NextResponse(payload, {
    status: upstream.ok ? 200 : upstream.status,
    headers: { "Content-Type": upstreamType },
  });
}
