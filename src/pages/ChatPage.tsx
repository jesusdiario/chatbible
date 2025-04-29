
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import ChatPageLayout from '@/components/chat/ChatPageLayout';
import LoadingChat from '@/components/chat/LoadingChat';
import SubscriptionRequired from '@/components/chat/SubscriptionRequired';
import BookChat from '@/components/BookChat';
import { useChatPageData } from '@/hooks/useChatPageData';

const ChatPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  
  const {
    chatDetails,
    isLoadingChat,
    requiresSubscription,
    subscribed,
    messages,
    isLoading,
    isTyping,
    handleSendMessage,
    startCheckout
  } = useChatPageData(slug);

  if (isLoadingChat) {
    return (
      <ChatPageLayout
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      >
        <LoadingChat 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={toggleSidebar} 
        />
      </ChatPageLayout>
    );
  }

  // Show subscription required view
  if (requiresSubscription && !subscribed) {
    return (
      <ChatPageLayout
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        title={chatDetails?.title || "Conversa"}
      >
        <SubscriptionRequired startCheckout={startCheckout} />
      </ChatPageLayout>
    );
  }

  return (
    <ChatPageLayout
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={toggleSidebar}
      title={chatDetails?.title}
    >
      <BookChat
        title={chatDetails?.title || "Chat"}
        messages={messages}
        isLoading={isLoading}
        isTyping={isTyping}
        bookSlug={chatDetails?.book_slug}
        onSendMessage={handleSendMessage}
      />
    </ChatPageLayout>
  );
};

export default ChatPage;
