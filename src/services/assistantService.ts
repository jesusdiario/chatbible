
import { AssistantApiResponse, ThreadResponse, RunResponse, RunStatus, AssistantMessagesResponse, AssistantDetailsResponse } from '@/types/assistant';

export const createThread = async (apiKey: string): Promise<ThreadResponse> => {
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
      const errorData = await response.json().catch(() => null);
      console.error('Thread creation error:', errorData);
      throw new Error(`Erro ao criar thread: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Sem detalhes adicionais'}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Thread creation exception:', error);
    throw new Error(`Falha na criação da thread: ${error.message}`);
  }
};

export const addMessageToThread = async (
  threadId: string, 
  content: string, 
  apiKey: string
): Promise<void> => {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Message creation error:', errorData);
      throw new Error(`Erro ao adicionar mensagem: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Sem detalhes adicionais'}`);
    }
  } catch (error: any) {
    console.error('Message creation exception:', error);
    throw new Error(`Falha ao adicionar mensagem à thread: ${error.message}`);
  }
};

export const runAssistant = async (
  threadId: string, 
  assistantId: string, 
  apiKey: string
): Promise<RunResponse> => {
  try {
    console.log(`Iniciando execução do assistente ${assistantId} na thread ${threadId}`);
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Run creation error:', errorData);
      throw new Error(`Erro ao executar o assistente: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Sem detalhes adicionais'}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Run creation exception:', error);
    throw new Error(`Falha ao iniciar execução do assistente: ${error.message}`);
  }
};

export const checkRunStatus = async (
  threadId: string, 
  runId: string, 
  apiKey: string
): Promise<RunStatus> => {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Status check error:', errorData);
      throw new Error(`Erro ao verificar status da execução: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Sem detalhes adicionais'}`);
    }

    const statusData = await response.json();
    
    // Se o status for failed, capturar detalhes específicos do erro
    if (statusData.status === 'failed') {
      console.error('Run failed with details:', JSON.stringify(statusData, null, 2));
      if (statusData.last_error) {
        throw new Error(`Falha na execução: ${statusData.last_error.code} - ${statusData.last_error.message}`);
      }
    }
    
    return statusData.status as RunStatus;
  } catch (error: any) {
    console.error('Status check exception:', error);
    throw new Error(`Falha ao verificar status: ${error.message}`);
  }
};

export const getThreadMessages = async (
  threadId: string, 
  apiKey: string
): Promise<AssistantMessagesResponse> => {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Messages retrieval error:', errorData);
      throw new Error(`Erro ao obter mensagens: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Sem detalhes adicionais'}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Messages retrieval exception:', error);
    throw new Error(`Falha ao obter mensagens da thread: ${error.message}`);
  }
};

// Função para verificar se o assistente existe e está acessível
export const verifyAssistant = async (
  assistantId: string,
  apiKey: string
): Promise<AssistantDetailsResponse> => {
  try {
    console.log(`Verificando assistente: ${assistantId}`);
    const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Assistant verification error:', errorData);
      throw new Error(`Assistente não encontrado ou inacessível: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Sem detalhes adicionais'}`);
    }

    const assistant = await response.json();
    console.log('Assistant details:', JSON.stringify(assistant, null, 2));
    return assistant;
  } catch (error: any) {
    console.error('Assistant verification failed:', error);
    throw new Error(`Falha ao verificar assistente: ${error.message}`);
  }
};
