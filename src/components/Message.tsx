
import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageProps = {
  role: 'user' | 'assistant';
  content: string;
};

const Message = ({ role, content }: MessageProps) => {
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
                className="markdown-content"
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                  p: ({node, ...props}) => <p className="my-2" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-400 pl-4 italic my-2" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                      : <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto my-4"><code {...props} /></pre>,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                  li: ({node, ...props}) => <li className="my-1" {...props} />
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
          {role === 'assistant' && <MessageActions />}
        </div>
      </div>
    </div>
  );
};

export default Message;
