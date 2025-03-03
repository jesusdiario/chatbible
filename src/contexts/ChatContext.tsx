
import React, { createContext, useContext } from "react";

// Chat context interface
export interface ChatContextType {
  sendMessage?: (content: string) => void;
}

// Create the context with default empty object
export const ChatContext = createContext<ChatContextType>({});

// Custom hook for using the chat context
export const useChatContext = () => useContext(ChatContext);
