"use client"

import { UserCircle } from "lucide-react";

export type ChatBubbleProps = {
  type: "user" | "bot";
  text: string;
};

export default function ChatBubble({ type, text }: ChatBubbleProps) {
  const isUser = type === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3`}>
      {!isUser && (
         <img
          src="/logo.png"
          className="w-10 h-10 rounded-full"
        />
      )}

      <div
        className={`max-w-lg px-5 py-4 rounded-2xl shadow ${
          isUser
            ? "bg-white"
            : "bg-[#E8FBE8]"
        }`}
      >
        <p className="text-sm text-gray-800 leading-relaxed">
          {text}
        </p>
      </div>

      {isUser && (
        <UserCircle className="w-10 h-10 rounded-full text-gray-400 hover:text-gray-600 transition-colors" />
      )}
    </div>
  );
}
