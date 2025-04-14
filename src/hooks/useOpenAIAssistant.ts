
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/message';

interface UseOpenAIAssistantProps {
  apiKey?: string;
  assistantId?: string;
}

interface UseOpenAIAssistantReturn {
  messages: Message[];
  isLoading: boolean;
  threadId: string | null;
  sendMessage: (content: string) => Promise<void>;
  resetThread: () => Promise<void>;
}

/**
 * Hook to interact with OpenAI Assistant API
 */
const useOpenAIAssistant = ({
  apiKey = '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',
  assistantId = 'asst_vK15nuJOl7DFWQu0VclHDZOq'
}: UseOpenAIAssistantProps = {}): UseOpenAIAssistantReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Creates a new thread for the conversation
   */
  const createThread = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error creating thread');
      }

      const data = await response.json();
      setThreadId(data.id);
      return data.id;
    } catch (error: any) {
      console.error('Error creating thread:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  /**
   * Resets the current thread and creates a new one
   */
  const resetThread = async (): Promise<void> => {
    setMessages([]);
    await createThread();
  };

  /**
   * Sends a message to the assistant and gets a response
   */
  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create thread if it doesn't exist
      const currentThreadId = threadId || await createThread();
      
      // Add user message to UI
      const newUserMessage: Message = {
        role: 'user',
        content
      };
      
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      
      // 1. Add message to thread
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content
        })
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json();
        throw new Error(errorData.error?.message || 'Error sending message');
      }

      // 2. Run the assistant
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });

      if (!runResponse.ok) {
        const errorData = await runResponse.json();
        throw new Error(errorData.error?.message || 'Error running assistant');
      }

      const runData = await runResponse.json();
      const runId = runData.id;

      // 3. Check run status
      let runStatus = 'in_progress';
      while (runStatus === 'in_progress' || runStatus === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        
        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          throw new Error(errorData.error?.message || 'Error checking status');
        }
        
        const statusData = await statusResponse.json();
        runStatus = statusData.status;
        
        if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
          throw new Error(`Run ${runStatus}: ${statusData.last_error?.message || 'Unknown error'}`);
        }
      }

      // 4. Get messages
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json();
        throw new Error(errorData.error?.message || 'Error getting messages');
      }
      
      const messagesData = await messagesResponse.json();
      const assistantMessage = messagesData.data.find((msg: any) => msg.role === 'assistant');
      
      if (assistantMessage) {
        const assistantContent = assistantMessage.content[0].text.value;
        
        const newAssistantMessage: Message = {
          role: 'assistant',
          content: assistantContent
        };

        setMessages(prevMessages => [...prevMessages, newAssistantMessage]);
      }
    } catch (error: any) {
      console.error('Error interacting with Assistant:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    threadId,
    sendMessage,
    resetThread
  };
};

export default useOpenAIAssistant;
