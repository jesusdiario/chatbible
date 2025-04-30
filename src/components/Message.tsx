
import { FC, useState, useEffect } from 'react';
import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message as MessageType } from '@/types/chat';
import { Skeleton } from './ui/skeleton';

interface MessageProps extends MessageType {
  isTyping?: boolean;
  showActions?: boolean;
  loadingStage?: string | null;
}

const Message: FC<MessageProps> = ({ 
  role, 
  content, 
  isTyping = false,
  showActions = true,
  loadingStage = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRenderActions, setShouldRenderActions] = useState(false);
  
  // Efeito para animar a entrada da mensagem
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Efeito para mostrar os botões de ação apenas quando a mensagem terminar de ser digitada
  useEffect(() => {
    if (!isTyping && role === 'assistant') {
      const timer = setTimeout(() => {
        setShouldRenderActions(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isTyping, role]);

  // Esqueleto de carregamento para mensagens do assistente
  if (role === 'assistant' && (content === '' || content.trim() === '') && isTyping) {
    return (
      <div className="py-6">
        <div className="flex gap-4">
          <MessageAvatar isAssistant={true} />
          <div className="flex-1 space-y-4">
            {loadingStage ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="text-lg font-semibold text-center">{loadingStage}</div>
                <div className="loading-dots mt-2">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            ) : (
              <>
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'} transition-opacity duration-300`}>
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <MessageAvatar isAssistant={role === 'assistant'} />
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex justify-end' : ''}`}>
          <div className={`${
            role === 'user' 
              ? 'bg-[#F7F7F8] rounded-[20px] px-4 py-2 inline-block text-foreground hover:bg-gray-100 transition-all duration-200' 
              : 'prose max-w-none text-black'
          }`}>
            {role === 'user' ? (
              content
            ) : (
              <>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4 text-black" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3 text-black" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2 text-black" {...props} />,
                    p: ({node, ...props}) => <p className="my-2 text-black" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-black" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-black" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-400 pl-4 italic my-2 text-black" {...props} />,
                    code: ({node, className, children, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !className ? (
                        <code className="bg-[#F7F7F8] px-1 py-0.5 rounded text-sm text-black" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-[#F7F7F8] p-4 rounded-md overflow-x-auto my-4 group relative">
                          <button 
                            onClick={() => navigator.clipboard.writeText(String(children))}
                            className="absolute top-2 right-2 bg-[#F7F7F8] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Copiar código"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                          <code className={`${className} text-black`} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 text-black" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 text-black" {...props} />,
                    li: ({node, ...props}) => <li className="my-1 text-black" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-600 hover:underline text-black" {...props} />
                  }}
                >
                  {content}
                </ReactMarkdown>
                {isTyping && (
                  <div className="typing-indicator mt-2">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </>
            )}
          </div>
          {role === 'assistant' && !isTyping && shouldRenderActions && showActions && (
            <div className="opacity-0 animate-fade-in" style={{animationDelay: '500ms', animationFillMode: 'forwards'}}>
              <MessageActions content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
