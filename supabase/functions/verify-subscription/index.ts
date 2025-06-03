
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log(`🔍 Verificando assinatura para usuário: ${user.email}`);

    // Verificar se a chave do Stripe existe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("❌ STRIPE_SECRET_KEY não encontrada!");
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    console.log(`✅ Stripe key encontrada: ${stripeKey.substring(0, 10)}...`);

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Buscar customer no Stripe
    console.log(`🔎 Buscando customer no Stripe para: ${user.email}`);
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      console.log("❌ Nenhum customer encontrado no Stripe, mantendo plano gratuito");
      // Sem customer = plano gratuito
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        plan_type: 'free',
        status: 'active',
        messages_used: 0,
        messages_limit: 30,
        is_unlimited: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_type: 'free',
        debug: 'No Stripe customer found'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log(`✅ Customer encontrado: ${customerId}`);

    // Buscar assinaturas ativas
    console.log(`🔎 Buscando assinaturas ativas para customer: ${customerId}`);
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    console.log(`📊 Encontradas ${subscriptions.data.length} assinaturas ativas`);
    
    // Log detalhado das assinaturas
    subscriptions.data.forEach((sub, index) => {
      console.log(`📋 Assinatura ${index + 1}:`);
      console.log(`   - ID: ${sub.id}`);
      console.log(`   - Status: ${sub.status}`);
      console.log(`   - Price ID: ${sub.items.data[0].price.id}`);
      console.log(`   - Valor: ${sub.items.data[0].price.unit_amount}`);
      console.log(`   - Período atual: ${new Date(sub.current_period_start * 1000).toISOString()} até ${new Date(sub.current_period_end * 1000).toISOString()}`);
    });

    let planType = 'free';
    let messagesLimit = 30;
    let isUnlimited = false;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0].price.id;
      
      console.log(`💰 Price ID da assinatura ativa: ${priceId}`);
      
      // Mapear price ID para plano
      if (priceId === "price_1RVbYyPpmCy5gtzzPUjXC12Z") {
        planType = 'pro';
        messagesLimit = 1000;
        console.log("🎯 Plano identificado: Pro");
      } else if (priceId === "price_1RVfjlPpmCy5gtzzfOMaqUJO") {
        planType = 'ultra';
        messagesLimit = 999999;
        isUnlimited = true;
        console.log("🎯 Plano identificado: Ultra");
      } else {
        console.log(`⚠️ Price ID desconhecido: ${priceId}`);
      }
    } else {
      console.log("❌ Nenhuma assinatura ativa encontrada");
    }

    // Atualizar no Supabase
    console.log(`💾 Atualizando Supabase: ${planType}, limite: ${messagesLimit}, ilimitado: ${isUnlimited}`);
    
    const { error: upsertError } = await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      plan_type: planType,
      status: 'active',
      messages_limit: messagesLimit,
      is_unlimited: isUnlimited,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error("❌ Erro ao atualizar subscription:", upsertError);
      throw upsertError;
    }

    console.log(`✅ Subscription atualizada com sucesso para ${user.email}: ${planType}`);

    return new Response(JSON.stringify({
      subscribed: planType !== 'free',
      plan_type: planType,
      messages_limit: messagesLimit,
      is_unlimited: isUnlimited,
      debug: {
        stripe_customer_id: customerId,
        active_subscriptions: subscriptions.data.length,
        price_ids: subscriptions.data.map(s => s.items.data[0].price.id)
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("💥 Error verifying subscription:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      debug: 'Check function logs for details'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
