
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WebhookMessage {
  numero: string;
  pergunta?: string;
  resposta?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('📨 Webhook recebido - processando mensagem...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData: WebhookMessage = await req.json();
    console.log('📦 Dados recebidos:', webhookData);

    // Validar dados obrigatórios
    if (!webhookData.numero) {
      console.error('❌ Número obrigatório ausente:', webhookData);
      return new Response(
        JSON.stringify({ error: 'numero é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar agente pelo número de telefone
    const cleanNumber = webhookData.numero.replace(/\D/g, '');
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name')
      .eq('phone_number', cleanNumber)
      .single();

    if (agentError || !agent) {
      console.error('❌ Agente não encontrado para número:', cleanNumber, agentError);
      return new Response(
        JSON.stringify({ error: 'Agente não encontrado para este número' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Agente encontrado:', agent.name);

    // Criar registro da mensagem
    const messageData = {
      agent_id: agent.id,
      numero: webhookData.numero,
      pergunta: webhookData.pergunta || '',
      resposta: webhookData.resposta || '',
      created_at: new Date().toISOString()
    };

    // Salvar mensagem
    const { error: messageError } = await supabase
      .from('agent_messages')
      .insert(messageData);

    if (messageError) {
      console.error('❌ Erro ao salvar mensagem:', messageError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar mensagem' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Mensagem processada com sucesso');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem recebida e processada com sucesso',
        agent_id: agent.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
