
import { Message } from '@/types/messages';

export const sendMessageToOpenAI = async (messages: Message[], apiKey: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 1000
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Erro ao comunicar com a API da OpenAI');
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
};
