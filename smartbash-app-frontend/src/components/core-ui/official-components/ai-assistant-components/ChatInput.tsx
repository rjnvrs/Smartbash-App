import { Send } from "lucide-react";
import { useState, ChangeEvent, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="sticky bottom-0 px-6 py-4 bg-gradient-to-t from-[#DFF5DF] to-transparent">
      <div className="flex items-center bg-white rounded-2xl px-5 py-3 shadow">
        <input
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything"
          className="flex-1 outline-none text-sm"
        />

        <button
          onClick={handleSend}
          className="ml-4 w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center"
        >
          <Send className="w-5 h-5 text-gray-700 hover:text-gray-900 transition-colors" />
        </button>
      </div>
    </div>
  );
}
