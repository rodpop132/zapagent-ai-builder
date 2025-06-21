
-- Criar tabela para armazenar mensagens dos agentes permanentemente
CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID,
  phone_number TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para estatísticas dos agentes
CREATE TABLE public.agent_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  total_messages INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para agent_conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.agent_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
  ON public.agent_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.agent_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas para agent_statistics
CREATE POLICY "Users can view their own statistics" 
  ON public.agent_statistics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" 
  ON public.agent_statistics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" 
  ON public.agent_statistics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_conversations_updated_at BEFORE UPDATE ON public.agent_conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_agent_statistics_updated_at BEFORE UPDATE ON public.agent_statistics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_agent_conversations_user_phone ON public.agent_conversations(user_id, phone_number);
CREATE INDEX idx_agent_conversations_created_at ON public.agent_conversations(created_at DESC);
CREATE INDEX idx_agent_statistics_user_phone ON public.agent_statistics(user_id, phone_number);
