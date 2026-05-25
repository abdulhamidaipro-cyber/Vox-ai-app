export type MessageKind = "reel-request" | "voice-request" | "text-hint";
export type ResponseKind = "reel" | "transcription" | "error";

export interface ChatMessageBase {
  id: string;
  createdAt: number;
}

export interface UserMessage extends ChatMessageBase {
  role: "user";
  kind: MessageKind;
  /** For reel-request: the URL. For voice-request: the audio duration (sec). */
  text?: string;
  audioBlobUrl?: string;
  audioDurationMs?: number;
}

export interface BotMessage extends ChatMessageBase {
  role: "bot";
  kind: ResponseKind;
  /** For transcription: the transcribed text. For error: human-readable error. */
  text?: string;
  /** For reel: object-URL to the downloaded mp4 Blob. */
  videoBlobUrl?: string;
  /** Pair with a user message so retry can re-fire with same input. */
  pairedRequestId?: string;
}

export interface LoadingMessage extends ChatMessageBase {
  role: "loading";
  kind: "reel" | "voice";
}

export type ChatMessage = UserMessage | BotMessage | LoadingMessage;

export interface Achievement {
  id: string;
  title: string; // Arabic
  description: string; // Arabic
  icon: string; // lucide icon name
}

export interface GameState {
  xp: number;
  reelsCount: number;
  transcriptionsCount: number;
  streakCurrent: number;
  streakBest: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  unlockedAchievements: string[]; // Achievement ids
}
