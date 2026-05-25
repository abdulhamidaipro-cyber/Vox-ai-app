import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 90;

const INSTAGRAM_URL =
  /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p|tv)\/[\w-]+/i;

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_INSTAGRAM_REEL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Server misconfigured: webhook URL missing." },
      { status: 500 },
    );
  }

  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!INSTAGRAM_URL.test(url)) {
    return NextResponse.json(
      { error: "الرجاء إدخال رابط ريل صحيح من إنستقرام." },
      { status: 400 },
    );
  }

  const authToken = process.env.N8N_AUTH_TOKEN;
  const upstream = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ url }),
  });

  // Upstream returned an error JSON (e.g., RapidAPI is down → 502)
  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || contentType.includes("application/json")) {
    const payload = await upstream.text();
    return new NextResponse(payload, {
      status: upstream.ok ? 200 : upstream.status,
      headers: { "Content-Type": contentType || "application/json" },
    });
  }

  // Success: stream the video binary straight back to the browser
  const filename = `reel-${Date.now()}.mp4`;
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType || "video/mp4",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
