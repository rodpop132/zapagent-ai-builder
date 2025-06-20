
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WebhookMessage {
  user_id: string;
  numero: string;
  mensagem_usuario?: string;
  resposta_bot?: string;
  timestamp?: string;
  tipo?: 'recebida' | 'enviada';
  contato?: string;
  nome_contato?: string;
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
    if (!webhookData.user_id || !webhookData.numero) {
      console.error('❌ Dados obrigatórios ausentes:', { user_id: webhookData.user_id, numero: webhookData.numero });
      return new Response(
        JSON.stringify({ error: 'user_id e numero são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se o agente existe
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, messages_used')
      .eq('user_id', webhookData.user_id)
      .eq('phone_number', webhookData.numero.includes('+') ? webhookData.numero : `+${webhookData.numero}`)
      .single();

    if (agentError || !agent) {
      console.error('❌ Agente não encontrado:', agentError);
      return new Response(
        JSON.stringify({ error: 'Agente não encontrado' }),
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
      user_message: webhookData.mensagem_usuario || '',
      bot_response: webhookData.resposta_bot || '',
      contact_number: webhookData.contato || '',
      contact_name: webhookData.nome_contato || 'Usuário',
      message_type: webhookData.tipo || 'recebida',
      timestamp: webhookData.timestamp || new Date().toISOString(),
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

    // Atualizar contador de mensagens do agente
    const newMessageCount = (agent.messages_used || 0) + 1;
    const { error: updateError } = await supabase
      .from('agents')
      .update({ 
        messages_used: newMessageCount,
        last_message_at: new Date().toISOString()
      })
      .eq('id', agent.id);

    if (updateError) {
      console.warn('⚠️ Erro ao atualizar contador de mensagens:', updateError);
    }

    console.log('✅ Mensagem processada com sucesso');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem recebida e processada com sucesso',
        agent_id: agent.id,
        message_count: newMessageCount
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
