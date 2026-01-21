"use client";
//modified by don
import { useState, useEffect, useRef } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import ChatArea from "../../../../components/core-ui/official-components/ai-assistant-components/ChatArea";
import ChatInput from "../../../../components/core-ui/official-components/ai-assistant-components/ChatInput";
import RecommendationButtons from "../../../../components/core-ui/official-components/ai-assistant-components/RecommendationPanel";
import { ChatBubbleProps } from "../../../../components/core-ui/official-components/ai-assistant-components/ChatBubble";
import { Send, UserCircle } from "lucide-react";

export default function AiAssistant() {
  const [messages, setMessages] = useState<ChatBubbleProps[]>([
    {
      type: "user",
      text: "AI, we're receiving multiple calls about a fire in the Riverside Apartments area. Several people need help. Can you help me sort and prioritize?",
    },
    {
      type: "bot",
      text: "Of course. Please provide the requests you've received, including the location of each person, their condition, and any immediate dangers.",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // Simulate AI thinking delay
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", text: reply }]);
    }, 700);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages((prev) => [...prev, { type: "user", text }]);
    
    // Clear input if it's from the input field
    if (text === inputText) {
      setInputText("");
    }

    // AI responds
    respondAsAI(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputText.trim()) {
      sendMessage(inputText);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-[#F3FFF3] to-[#DFF5DF]">
      <Sidebar />

      {/* Main content - Full screen layout like your previous code */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col px-4 md:px-6 py-4 md:py-6">

          {/* Main chat container - Full width like before */}
          <div className="flex-1 flex flex-col bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 overflow-hidden">
            
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="BASH AI"
                    className="w-10 h-10 rounded-full border border-green-200"
                  />
                  <div>
                    <h2 className="text-green-800 font-bold">BASH AI Assistant</h2>
                    <p className="text-green-600 text-sm">Emergency Response Intelligence</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  Online
                </div>
              </div>
            </div>

            {/* Chat area container */}
            <div className="flex-1 flex flex-col p-4">
              
              {/* Welcome message */}
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <p className="text-green-700 text-sm">
                  <span className="font-semibold">Ready to assist.</span> Describe the emergency situation or use quick actions below.
                </p>
              </div>

              {/* Chat messages - Full width scrollable area */}
              <div className="flex-1 overflow-y-auto px-2 mb-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} gap-3`}
                    >
                      {msg.type === "bot" && (
                        <div className="flex-shrink-0">
                          <img
                            src="/logo.png"
                            alt="AI"
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-green-200"
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-xs md:max-w-lg px-4 py-3 md:px-5 md:py-4 rounded-2xl shadow ${
                          msg.type === "user"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-[#E8FBE8] border border-green-100"
                        }`}
                      >
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {msg.text}
                        </p>
                      </div>

                      {msg.type === "user" && (
                        <div className="flex-shrink-0">
                          <UserCircle className="w-8 h-8 md:w-10 md:h-10 rounded-full text-green-600 hover:text-green-800 transition-colors" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Recommendations buttons */}
              <div className="mb-4">
                <div className="mb-2">
                  <p className="text-green-700 text-sm font-medium mb-2">Quick Actions:</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <RecommendationButtons onSend={sendMessage} />
                </div>
              </div>

            </div>

            {/* Chat input - Sticky at bottom of container */}
            <div className="border-t border-green-100 bg-gradient-to-r from-green-50/50 to-emerald-50/50 p-4">
              <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-green-100">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about the emergency..."
                  className="flex-1 outline-none text-sm bg-transparent text-green-900 placeholder-green-400"
                />
                <button
                  onClick={() => inputText.trim() && sendMessage(inputText)}
                  className="ml-3 w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputText.trim()}
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}