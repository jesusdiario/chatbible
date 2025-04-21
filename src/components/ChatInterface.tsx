
import React from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { ChatContext, ActionButtons } from './ActionButtons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

const ChatInterface = ({ messages, isLoading, onSendMessage }: ChatInterfaceProps) => {
  return (
    <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
      {messages.length === 0 ? (
        <div className="w-full max-w-3xl px-4 space-y-4">
          <div>
            <h1 className="mb-8 text-4xl font-semibold text-center">
              Gênesis - Como podemos ajudar?
            </h1>
            <ChatInput onSend={onSendMessage} isLoading={isLoading} />
          </div>
          <ChatContext.Provider value={{ sendMessage: onSendMessage }}>
            <ActionButtons />
          </ChatContext.Provider>
        </div>
      ) : (
        <>
          <MessageList messages={messages} />
          <div className="w-full max-w-3xl mx-auto px-4 py-2">
            <ChatInput onSend={onSendMessage} isLoading={isLoading} />
          </div>
          <div className="text-xs text-center text-gray-500 py-2">
            O BibleGPT pode cometer erros. Verifique informações importantes.
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
