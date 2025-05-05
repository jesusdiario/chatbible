
CREATE TABLE public.biblia_buttons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  button_name TEXT NOT NULL,
  button_icon TEXT NOT NULL,
  prompt_ai TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserindo alguns botões de exemplo
INSERT INTO public.biblia_buttons (button_name, button_icon, prompt_ai, slug)
VALUES 
  ('Exegese', 'annotation', 'Você é um exegeta bíblico. Faça uma análise exegética detalhada do seguinte texto bíblico, incluindo contexto histórico, análise linguística, significado teológico e aplicação contemporânea:', 'exegese'),
  ('Orar', 'pray', 'Você é um assistente de oração cristão. Escreva uma oração baseada no seguinte texto bíblico, focando nos temas principais e na aplicação espiritual:', 'orar'),
  ('Compartilhar', 'share', 'Você é um especialista em comunicação cristã. Prepare uma mensagem inspiradora para compartilhar nas redes sociais baseada neste texto bíblico:', 'compartilhar'),
  ('Imagem', 'image', 'Você é um curador de imagens cristãs. Descreva uma imagem que represente visualmente o texto bíblico a seguir, com detalhes sobre composição, simbolismo e significado espiritual:', 'imagem'),
  ('Compare', 'compare', 'Você é um especialista em análise comparativa de textos bíblicos. Compare este texto com outras passagens da Bíblia que abordam temas semelhantes, destacando semelhanças e diferenças:', 'compare'),
  ('Copiar', 'copy', '', 'copiar');

-- Configurar políticas de segurança para a tabela
ALTER TABLE public.biblia_buttons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública dos botões"
ON public.biblia_buttons
FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir atualização de botões para usuários autenticados"
ON public.biblia_buttons
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de botões para usuários autenticados"
ON public.biblia_buttons
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir exclusão de botões para usuários autenticados"
ON public.biblia_buttons
FOR DELETE
TO authenticated
USING (true);
