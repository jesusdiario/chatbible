import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AssistantChatProps {
  assistantId: string;
  placeholder?: string;
  className?: string;
}

const AssistantChat = ({ assistantId, placeholder = "Escreva sua mensagem...", className }: AssistantChatProps) => {
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Rolar para o final quando novas mensagens são adicionadas
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const createThread = async () => {
    try {
      const response = await fetch("/api/create-thread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.threadId;
    } catch (error) {
      console.error("Failed to create thread:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar nova thread.",
        variant: "destructive"
      });
      return null;
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: text };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      let currentThreadId = threadId;

      if (!currentThreadId) {
        currentThreadId = await createThread();
        if (currentThreadId) {
          setThreadId(currentThreadId);
        } else {
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/add-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: currentThreadId,
          assistantId: assistantId,
          content: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const runData = await response.json();

      // Polling para verificar o status da execução
      const getRunStatus = async (runId: string) => {
        try {
          const statusResponse = await fetch(`/api/check-run-status?threadId=${currentThreadId}&runId=${runId}`);
          if (!statusResponse.ok) {
            throw new Error(`HTTP error! status: ${statusResponse.status}`);
          }
          const statusData = await statusResponse.json();
          return statusData.status;
        } catch (error) {
          console.error("Failed to check run status:", error);
          return "failed"; // Tratar como falha para interromper o polling
        }
      };

      // Função para aguardar até que a execução seja concluída
      const waitForRunCompletion = async (runId: string) => {
        let status = await getRunStatus(runId);
        while (status !== "completed" && status !== "failed") {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
          status = await getRunStatus(runId);
        }
        return status;
      };

      const finalStatus = await waitForRunCompletion(runData.runId);

      if (finalStatus === "completed") {
        // Recuperar as mensagens atualizadas
        const messagesResponse = await fetch(`/api/get-messages?threadId=${currentThreadId}`);
        if (!messagesResponse.ok) {
          throw new Error(`HTTP error! status: ${messagesResponse.status}`);
        }
        const messagesData = await messagesResponse.json();
        // Atualizar o estado das mensagens com as mensagens recuperadas
        setMessages(messagesData.messages);
      } else {
        toast({
          title: "Erro",
          description: "Falha ao obter resposta do assistente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      sendMessage(message);
      setMessage("");
    }
  };

  // Adicione useEffect para ouvir sugestões rápidas
  useEffect(() => {
    const onQuick = (e: CustomEvent) => {
      if (e.detail && typeof e.detail === "string" && typeof sendMessage === "function") {
        sendMessage(e.detail);
      }
    };
    window.addEventListener("assistant-message", onQuick as any);
    return () => window.removeEventListener("assistant-message", onQuick as any);
  }, [sendMessage]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 p-3 rounded-lg ${msg.role === "user" ? "bg-gray-700 text-white self-end" : "bg-gray-800 text-white self-start"}`}>
            <div className="font-bold">{msg.role === "user" ? "Você" : "GPT"}</div>
            <div>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-2 p-3 rounded-lg bg-gray-800 text-white self-start">
            <div className="font-bold">GPT</div>
            <div>
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center">
        <Input
          type="text"
          placeholder={placeholder}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 mr-2"
        />
        <Button onClick={() => { sendMessage(message); setMessage(""); }} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default AssistantChat;
