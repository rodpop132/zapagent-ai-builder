
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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Buscar customer no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
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
        plan_type: 'free' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    // Buscar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let planType = 'free';
    let messagesLimit = 30;
    let isUnlimited = false;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0].price.id;
      
      // Mapear price ID para plano
      if (priceId === "price_1RVbYyPpmCy5gtzzPUjXC12Z") {
        planType = 'pro';
        messagesLimit = 1000;
      } else if (priceId === "price_1RVfjlPpmCy5gtzzfOMaqUJO") {
        planType = 'ultra';
        messagesLimit = 999999;
        isUnlimited = true;
      }
    }

    // Atualizar no Supabase
    await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      plan_type: planType,
      status: 'active',
      messages_limit: messagesLimit,
      is_unlimited: isUnlimited,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    console.log(`Subscription verified for ${user.email}: ${planType}`);

    return new Response(JSON.stringify({
      subscribed: planType !== 'free',
      plan_type: planType
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
