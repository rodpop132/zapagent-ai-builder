
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    let user = null;
    
    // Tentar obter usuário autenticado
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        user = userData.user;
        console.log('✅ Usuário autenticado:', user?.email);
      } catch (error) {
        console.log('⚠️ Sem usuário autenticado, verificando pagamentos recentes');
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    let planType = 'free';
    let messagesLimit = 30;
    let isUnlimited = false;
    let customerEmail = user?.email;

    // Se não há usuário autenticado, verificar últimos pagamentos
    if (!user) {
      console.log('🔍 Verificando últimos checkouts para identificar pagamentos recentes...');
      
      // Buscar sessões de checkout recentes (últimas 24 horas)
      const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
      
      try {
        const sessions = await stripe.checkout.sessions.list({
          limit: 20,
          created: { gte: twentyFourHoursAgo }
        });
        
        // Encontrar a sessão mais recente com pagamento bem-sucedido
        const recentSession = sessions.data.find(session => 
          session.payment_status === 'paid' && 
          session.customer_email &&
          session.mode === 'subscription'
        );
        
        if (recentSession) {
          customerEmail = recentSession.customer_email;
          console.log('📧 Email encontrado em checkout recente:', customerEmail);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar sessões de checkout:', error);
      }
    }

    if (!customerEmail) {
      console.log('⚠️ Nenhum email encontrado para verificação');
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_type: 'free',
        message: 'Nenhum email encontrado'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`🔍 Verificando assinatura para: ${customerEmail}`);

    // Buscar customer no Stripe
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      console.log('❌ Nenhum customer encontrado no Stripe');
      
      // Garantir que existe registro na tabela subscriptions
      if (user?.id) {
        await supabaseClient
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            messages_used: 0,
            messages_limit: 30,
            is_unlimited: false,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }

      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_type: 'free'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log(`✅ Customer encontrado: ${customerId}`);

    // Buscar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    console.log(`📊 Encontradas ${subscriptions.data.length} assinaturas ativas`);

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0].price.id;
      
      console.log(`💰 Price ID da assinatura ativa: ${priceId}`);
      
      // Mapear price ID para plano - usando os novos links do Stripe
      if (priceId === "price_1RVbYyPpmCy5gtzzPUjXC12Z" || priceId.includes("pro")) {
        planType = 'pro';
        messagesLimit = 10000;
        console.log('✅ Plano Pro identificado');
      } else if (priceId === "price_1RVfjlPpmCy5gtzzfOMaqUJO" || priceId.includes("ultra")) {
        planType = 'ultra';
        messagesLimit = 999999;
        isUnlimited = true;
        console.log('✅ Plano Ultra identificado');
      } else {
        console.log(`⚠️ Price ID não reconhecido: ${priceId}, assumindo Pro`);
        planType = 'pro';
        messagesLimit = 10000;
      }
    }

    console.log(`🔄 Atualizando banco: ${planType}, limite: ${messagesLimit}`);

    // Atualizar ou criar registro na tabela subscriptions
    if (user?.id) {
      // Usuário autenticado - atualizar por user_id
      const { error: updateError } = await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: planType,
          status: 'active',
          messages_limit: messagesLimit,
          is_unlimited: isUnlimited,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (updateError) {
        console.error('❌ Erro ao atualizar assinatura:', updateError);
      } else {
        console.log('✅ Assinatura atualizada com sucesso');
      }
    } else {
      // Checkout sem usuário - verificar se já existe usuário com este email
      console.log('🔍 Procurando usuário existente com email:', customerEmail);
      
      const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
      const userWithEmail = existingUsers.users.find(u => u.email === customerEmail);
      
      if (userWithEmail) {
        console.log('✅ Usuário encontrado, atualizando assinatura:', userWithEmail.id);
        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .upsert({
            user_id: userWithEmail.id,
            plan_type: planType,
            status: 'active',
            messages_limit: messagesLimit,
            is_unlimited: isUnlimited,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (updateError) {
          console.error('❌ Erro ao atualizar assinatura:', updateError);
        } else {
          console.log('✅ Assinatura atualizada para usuário existente');
        }
      }
    }

    console.log(`🎉 Verificação concluída para ${customerEmail}: ${planType}`);

    return new Response(JSON.stringify({
      subscribed: planType !== 'free',
      plan_type: planType,
      messages_limit: messagesLimit,
      is_unlimited: isUnlimited,
      customer_email: customerEmail
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("💥 Erro ao verificar assinatura:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      subscribed: false,
      plan_type: 'free'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
