
-- Criar tabela para armazenar mensagens do webhook
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id),
  numero TEXT NOT NULL,
  pergunta TEXT,
  resposta TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índice para melhor performance nas consultas por número
CREATE INDEX idx_agent_messages_numero ON public.agent_messages(numero);
CREATE INDEX idx_agent_messages_created_at ON public.agent_messages(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas mensagens dos seus agentes
CREATE POLICY "Users can view messages from their agents" 
  ON public.agent_messages 
  FOR SELECT 
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );
