
export interface ChatHistory {
  id: string;
  title: string;
  lastAccessed: Date;
}

export interface TimeframedHistory {
  title: string;
  items: ChatHistory[];
}

export const categorizeChatHistory = (chats: ChatHistory[]): TimeframedHistory[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const today: ChatHistory[] = [];
  const yesterdayChats: ChatHistory[] = [];
  const lastSevenDays: ChatHistory[] = [];
  const lastThirtyDays: ChatHistory[] = [];

  chats.forEach(chat => {
    const chatDate = new Date(chat.lastAccessed);
    
    if (chatDate.toDateString() === now.toDateString()) {
      today.push(chat);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      yesterdayChats.push(chat);
    } else if (chatDate >= sevenDaysAgo) {
      lastSevenDays.push(chat);
    } else if (chatDate >= thirtyDaysAgo) {
      lastThirtyDays.push(chat);
    }
  });

  const timeframes: TimeframedHistory[] = [];

  if (today.length > 0) {
    timeframes.push({
      title: "Hoje",
      items: today.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
    });
  }

  if (yesterdayChats.length > 0) {
    timeframes.push({
      title: "Ontem",
      items: yesterdayChats.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
    });
  }

  if (lastSevenDays.length > 0) {
    timeframes.push({
      title: "Últimos 7 Dias",
      items: lastSevenDays.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
    });
  }

  if (lastThirtyDays.length > 0) {
    timeframes.push({
      title: "Últimos 30 Dias",
      items: lastThirtyDays.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
    });
  }

  return timeframes;
};
