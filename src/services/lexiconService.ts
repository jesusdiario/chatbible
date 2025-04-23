// src/services/lexiconService.ts
export async function sendToAssistant(
  message: string,
  threadId?: string
): Promise<{ threadId: string; response: string }> {
  const res = await fetch("/functions/lexicon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, threadId })
  });
  if (!res.ok) throw new Error("Erro ao chamar o Assistant");
  return res.json();
}