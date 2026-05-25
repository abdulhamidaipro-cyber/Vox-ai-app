import { Header } from "@/components/Header";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { GamePanel } from "@/components/game/GamePanel";
import { LevelUpOverlay } from "@/components/game/LevelUpOverlay";
import { AchievementToastBridge } from "@/components/game/AchievementToast";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

export default function HomePage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-bg text-fg">
      <GrainOverlay />

      <div className="relative z-[2] flex h-full flex-col">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 flex-col overflow-hidden">
            <MessageList />
            <ChatInput />
          </main>

          <GamePanel />
        </div>
      </div>

      <LevelUpOverlay />
      <AchievementToastBridge />
    </div>
  );
}
