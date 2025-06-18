
-- Criar tabela para afiliados
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  affiliate_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instagram_handle TEXT,
  youtube_channel TEXT,
  other_social TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para rastreamento de cliques
CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliates(id) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para conversões/vendas
CREATE TABLE public.affiliate_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliates(id) NOT NULL,
  click_id UUID REFERENCES public.affiliate_clicks(id),
  user_id UUID REFERENCES auth.users,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('registration', 'purchase')),
  order_value DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  converted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para affiliates
CREATE POLICY "Afiliados podem ver seus próprios dados" 
  ON public.affiliates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar perfil de afiliado" 
  ON public.affiliates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Afiliados podem atualizar seus dados" 
  ON public.affiliates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para affiliate_clicks (públicas para rastreamento)
CREATE POLICY "Permitir inserção de cliques" 
  ON public.affiliate_clicks 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Afiliados podem ver seus cliques" 
  ON public.affiliate_clicks 
  FOR SELECT 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Políticas RLS para affiliate_conversions
CREATE POLICY "Afiliados podem ver suas conversões" 
  ON public.affiliate_conversions 
  FOR SELECT 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Sistema pode criar conversões" 
  ON public.affiliate_conversions 
  FOR INSERT 
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar código de afiliado único
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN := TRUE;
BEGIN
    WHILE exists_check LOOP
        -- Gerar código de 8 dígitos
        code := LPAD(floor(random() * 100000000)::TEXT, 8, '0');
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE affiliate_code = code) INTO exists_check;
    END LOOP;
    
    RETURN code;
END;
$$;
