
-- Criar tabela para rastrear uso de mensagens de IA
CREATE TABLE public.ai_messages_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages_generated INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.ai_messages_usage ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own AI usage" 
  ON public.ai_messages_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários atualizarem apenas seus próprios dados
CREATE POLICY "Users can update own AI usage" 
  ON public.ai_messages_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para inserir dados de uso
CREATE POLICY "Users can insert own AI usage" 
  ON public.ai_messages_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Função para obter limite de mensagens IA por plano
CREATE OR REPLACE FUNCTION get_ai_messages_limit(plan_type TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  CASE plan_type
    WHEN 'free' THEN RETURN 10;
    WHEN 'pro' THEN RETURN 10000;
    WHEN 'ultra' THEN RETURN 999999;
    WHEN 'unlimited' THEN RETURN 999999;
    ELSE RETURN 10;
  END CASE;
END;
$$;

-- Função para resetar contador mensal (se necessário)
CREATE OR REPLACE FUNCTION reset_monthly_ai_usage()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.ai_messages_usage 
  SET messages_generated = 0, 
      last_reset_date = CURRENT_DATE, 
      updated_at = now()
  WHERE last_reset_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$;
