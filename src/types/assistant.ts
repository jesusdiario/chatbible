
import { Message } from './messages';

export type AssistantApiResponse = {
  id: string;
  status: string;
};

export type ThreadResponse = {
  id: string;
};

export type RunResponse = {
  id: string;
  status: string;
  last_error?: {
    code: string;
    message: string;
  };
};

export type RunStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'expired' | 'requires_action';

export type AssistantMessagesResponse = {
  data: Array<{
    role: string;
    content: Array<{
      text: {
        value: string;
      };
    }>;
  }>;
};

export type AssistantError = {
  code: string;
  message: string;
};

export type AssistantDetailsResponse = {
  id: string;
  object: string;
  created_at: number;
  name: string;
  description: string | null;
  model: string;
  instructions: string | null;
  tools: Array<any>;
  metadata: Record<string, any>;
}
