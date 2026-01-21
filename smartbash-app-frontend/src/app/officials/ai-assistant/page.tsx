"use client";
//modified by don
import { useState } from "react";
import Sidebar from "../../../components/core-ui/official-components/Sidebar";
import ChatArea from "../../../components/core-ui/official-components/ai-assistant-components/ChatArea";
import ChatInput from "../../../components/core-ui/official-components/ai-assistant-components/ChatInput";
import RecommendationButtons from "../../../components/core-ui/official-components/ai-assistant-components/RecommendationPanel";
import { ChatBubbleProps } from "../../../components/core-ui/official-components/ai-assistant-components/ChatBubble";

export default function page() {
  const [messages, setMessages] = useState<ChatBubbleProps[]>([
    {
      type: "user",
      text: "AI, we’re receiving multiple calls about a fire in the Riverside Apartments area. Several people need help. Can you help me sort and prioritize?",
    },
    {
      type: "bot",
      text: "Of course. Please provide the requests you’ve received, including the location of each person, their condition, and any immediate dangers.",
    },
  ]);

  const respondAsAI = (userText: string) => {
    let reply = "Acknowledged. Please provide more details.";

    if (userText.toLowerCase().includes("high-risk")) {
      reply =
        "High-risk areas identified: upper floors, stairwells with smoke, and units near the fire origin.";
    }

    if (userText.toLowerCase().includes("recommend")) {
      reply =
        "Recommended actions: prioritize trapped residents, dispatch fire units to upper floors, and request medical standby.";
    }

    setMessages((prev) => [...prev, { type: "bot", text: reply }]);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { type: "user", text }]);

    setTimeout(() => respondAsAI(text), 700);
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-[#F3FFF3] to-[#DFF5DF]">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col px-6 py-6">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo.png"
              alt="BASH AI"
              className="w-24 h-24 mb-3"
            />
            <h1 className="text-green-700 font-semibold text-lg">BASH AI</h1>
          </div>

          {/* Chat area, recommendations, and input */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat messages */}
            <ChatArea messages={messages} />

            {/* Recommendations buttons */}
            <div className="flex flex-wrap gap-3 mb-3 mt-3">
              <RecommendationButtons onSend={sendMessage} />
            </div>

            {/* Chat input */}
            <ChatInput onSend={sendMessage} />
          </div>
        </main>
      </div>
    </div>
  );
}
