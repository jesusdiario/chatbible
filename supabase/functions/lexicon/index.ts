import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(req: Request) {
  const { message, threadId } = await req.json();

  // 1. Cria thread se for a primeira mensagem
  const thread_id = threadId
    ? threadId
    : (await openai.beta.threads.create()).id;

  // 2. Insere a mensagem do usuário na thread
  await openai.beta.threads.messages.create({
    thread_id,
    role: "user",
    content: message
  });

  // 3. Executa o Assistant na thread
  const run = await openai.beta.threads.runs.create({
    thread_id,
    assistant_id: "asst_YLwvqvZmSOMwxaku53jtKAlt"
  });

  // 4. Polling até a resposta ficar pronta
  let status = run.status;
  while (status !== "completed") {
    await new Promise(r => setTimeout(r, 500));
    const updated = await openai.beta.threads.runs.retrieve({
      thread_id,
      run_id: run.id
    });
    status = updated.status;
  }

  // 5. Recupera as mensagens da thread e devolve a última
  const msgs = await openai.beta.threads.messages.list({
    thread_id
  });
  const reply = msgs.data.find(m => m.role === "assistant")?.content;

  return new Response(
    JSON.stringify({ threadId: thread_id, response: reply }),
    { headers: { "Content-Type": "application/json" } }
  );
}