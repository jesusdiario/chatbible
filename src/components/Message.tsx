
import { useState, useEffect, useRef } from 'react';
import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageProps = {
  role: 'user' | 'assistant';
  content: string;
};

const Message = ({ role, content }: MessageProps) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Velocidade de digitação (ms por caractere)
  const typingSpeed = 20;
  
  useEffect(() => {
    // Somente aplicar o efeito de digitação para mensagens do assistente
    if (role === 'assistant') {
      setIsTyping(true);
      setDisplayedContent('');
      
      let currentIndex = 0;
      const contentLength = content.length;
      
      // Função para adicionar um caractere por vez
      const typeNextCharacter = () => {
        if (currentIndex < contentLength) {
          setDisplayedContent(prev => prev + content[currentIndex]);
          currentIndex++;
          setTimeout(typeNextCharacter, typingSpeed);
        } else {
          setIsTyping(false);
        }
      };
      
      // Iniciar o efeito de digitação
      typeNextCharacter();
    } else {
      // Para mensagens do usuário, mostrar conteúdo completo imediatamente
      setDisplayedContent(content);
    }
  }, [content, role]);
  
  // Efeito para rolagem automática durante a digitação
  useEffect(() => {
    if (isTyping && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [displayedContent, isTyping]);

  return (
    <div className="py-6">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <MessageAvatar isAssistant={role === 'assistant'} />
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex justify-end' : ''}`}>
          <div className={`${role === 'user' ? 'bg-gray-700/50 rounded-[20px] px-4 py-2 inline-block' : 'prose prose-invert max-w-none'}`}>
            {role === 'user' ? (
              content
            ) : (
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
                      <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto my-4">
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
                {displayedContent}
              </ReactMarkdown>
            )}
          </div>
          {/* Indicador de digitação visível apenas enquanto estiver digitando */}
          {role === 'assistant' && isTyping && (
            <div className="text-sm text-gray-400 animate-pulse">
              Digitando...
            </div>
          )}
          {/* Elemento de referência para rolagem automática */}
          <div ref={messageEndRef} />
          
          {/* Mostrar as ações apenas quando terminar de digitar */}
          {role === 'assistant' && !isTyping && <MessageActions content={content} />}
        </div>
      </div>
    </div>
  );
};

export default Message;
