
import React, { useState } from "react";

interface AssistantChatProps {
  assistantId: string;
  placeholder: string;
  className?: string;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ assistantId, placeholder, className }) => {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Minimal working placeholder—should be replaced by your final implementation
  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    // Simulate OpenAI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Resposta do assistente (${assistantId}): [simulado]` }
      ]);
      setLoading(false);
    }, 800);
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "assistant" ? "text-left text-neutral-200" : "text-right text-blue-400"}>
            <span>{msg.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 border rounded p-2 bg-background"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
        />
        <button
          className="bg-primary px-4 rounded text-white disabled:opacity-40"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default AssistantChat;
