
import { Link } from "react-router-dom";
import { ChatHistory } from "@/types/chat";

interface ChatHistoryListProps {
  chatHistory: ChatHistory[];
}

const ChatHistoryList = ({ chatHistory }: ChatHistoryListProps) => {
  if (chatHistory.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Nenhuma conversa anterior.
      </p>
    );
  }
  
  return (
    <ul className="space-y-2">
      {chatHistory.map((chat) => (
        <li key={chat.id}>
          <Link
            to={chat.slug ? `/chat/${chat.slug}` : "/"}
            className="block p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{chat.title}</span>
              <time className="text-xs text-muted-foreground">
                {new Date(chat.lastAccessed).toLocaleDateString('pt-BR')}
              </time>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default ChatHistoryList;
