
import { Message } from '@/types';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import ActionButtons, { ChatContext } from '@/components/ActionButtons';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

const ChatContainer = ({ messages, isLoading, onSendMessage }: ChatContainerProps) => {
  if (messages.length === 0) {
    return (
      <div className="w-full max-w-3xl px-4 space-y-4">
        <div>
          <h1 className="mb-8 text-4xl font-semibold text-center">Como podemos ajudar?</h1>
          <ChatInput onSend={onSendMessage} isLoading={isLoading} />
        </div>
        <ChatContext.Provider value={{ sendMessage: onSendMessage }}>
          <ActionButtons />
        </ChatContext.Provider>
      </div>
    );
  }

  return (
    <>
      <MessageList messages={messages} />
      <div className="w-full max-w-3xl mx-auto px-4 py-2">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
      <div className="text-xs text-center text-gray-500 py-2">
        O BibleGPT pode cometer erros. Verifique informações importantes.
      </div>
    </>
  );
};

export default ChatContainer;
