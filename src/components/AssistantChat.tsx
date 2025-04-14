
import React from 'react';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';
import { Message } from '@/types/message';
import useOpenAIAssistant from '@/hooks/useOpenAIAssistant';

interface AssistantChatProps {
  apiKey?: string;
  assistantId?: string;
  placeholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

const AssistantChat = ({
  apiKey,
  assistantId,
  placeholder = "Type your message...",
  emptyStateTitle = "BibleGPT Assistant",
  emptyStateDescription = "Ask any questions about the Bible or theology"
}: AssistantChatProps) => {
  const {
    messages,
    isLoading,
    sendMessage
  } = useOpenAIAssistant({ apiKey, assistantId });

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center pt-[60px] pb-4">
        <EmptyStatePrompt 
          title={emptyStateTitle}
          description={emptyStateDescription}
          onSendMessage={sendMessage} 
          isLoading={isLoading} 
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
      <MessageList messages={messages} />
      <div className="w-full max-w-3xl mx-auto px-4 py-2">
        <ChatInput onSend={sendMessage} isLoading={isLoading} inputPlaceholder={placeholder} />
      </div>
      <div className="text-xs text-center text-gray-500 py-2">
        O BibleGPT pode cometer erros. Verifique informações importantes.
      </div>
    </div>
  );
};

export default AssistantChat;
