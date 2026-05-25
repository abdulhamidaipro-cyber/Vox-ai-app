const INSTAGRAM_URL =
  /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p|tv)\/[\w-]+/i;

export function isInstagramUrl(text: string): boolean {
  return INSTAGRAM_URL.test(text.trim());
}

export function detectInputType(text: string): "reel" | "unknown" {
  return isInstagramUrl(text) ? "reel" : "unknown";
}
