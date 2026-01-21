"use client"

import { useEffect, useRef } from "react";
import ChatBubble, { ChatBubbleProps } from "./ChatBubble";

export type Message = ChatBubbleProps;

interface ChatAreaProps {
  messages?: Message[];
}

export default function ChatArea({ messages = [] }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-2">
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <ChatBubble key={index} type={msg.type} text={msg.text} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
