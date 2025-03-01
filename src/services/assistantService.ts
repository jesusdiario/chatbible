
import { AssistantApiResponse, ThreadResponse, RunResponse, RunStatus, AssistantMessagesResponse } from '@/types/assistant';

export const createThread = async (apiKey: string): Promise<ThreadResponse> => {
  const response = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'  // Atualizado para v2
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Thread creation error:', errorData);
    throw new Error(`Erro ao criar thread: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const addMessageToThread = async (
  threadId: string, 
  content: string, 
  apiKey: string
): Promise<void> => {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'  // Atualizado para v2
    },
    body: JSON.stringify({
      role: 'user',
      content
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Message creation error:', errorData);
    throw new Error(`Erro ao adicionar mensagem: ${response.status} ${response.statusText}`);
  }
};

export const runAssistant = async (
  threadId: string, 
  assistantId: string, 
  apiKey: string
): Promise<RunResponse> => {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'  // Atualizado para v2
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Run creation error:', errorData);
    throw new Error(`Erro ao executar o assistente: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const checkRunStatus = async (
  threadId: string, 
  runId: string, 
  apiKey: string
): Promise<RunStatus> => {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'  // Atualizado para v2
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Status check error:', errorData);
    throw new Error(`Erro ao verificar status da execução: ${response.status} ${response.statusText}`);
  }

  const statusData = await response.json();
  return statusData.status as RunStatus;
};

export const getThreadMessages = async (
  threadId: string, 
  apiKey: string
): Promise<AssistantMessagesResponse> => {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'  // Atualizado para v2
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Messages retrieval error:', errorData);
    throw new Error(`Erro ao obter mensagens: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};
