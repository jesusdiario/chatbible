import { FC } from 'react';
import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message as MessageType } from '@/types/chat';

interface MessageProps extends MessageType {
  isTyping?: boolean;
}

const Message: FC<MessageProps> = ({ role, content, isTyping = false }) => {
  return (
    <div className="py-6 animate-fade-in">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <MessageAvatar isAssistant={role === 'assistant'} />
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex justify-end' : ''}`}>
          <div className={`${
            role === 'user' 
              ? 'bg-gray-700/50 rounded-[20px] px-4 py-2 inline-block hover:bg-gray-700/70 transition-all duration-200' 
              : 'prose prose-invert max-w-none'
          }`}>
            {role === 'user' ? (
              content
            ) : (
              <>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                    p: ({node, ...props}) => <p className="my-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-400 pl-4 italic my-2" {...props} />,
                    code: ({node, className, children, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !className ? (
                        <code className="bg-[#F7F7F8] px-1 py-0.5 rounded text-sm" {...props}>
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
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="my-1" {...props} />
                  }}
                >
                  {content}
                </ReactMarkdown>
                {isTyping && (
                  <span className="inline-block w-2 h-4 ml-1 -mb-1 bg-white animate-blink" />
                )}
              </>
            )}
          </div>
          {role === 'assistant' && !isTyping && <MessageActions content={content} />}
        </div>
      </div>
    </div>
  );
};

export default Message;
