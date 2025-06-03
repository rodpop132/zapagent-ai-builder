
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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { planType } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Definir preços baseado no plano
    const priceIds = {
      pro: "price_1RVbYyPpmCy5gtzzPUjXC12Z",
      ultra: "price_1RVfjlPpmCy5gtzzfOMaqUJO"
    };

    const priceId = priceIds[planType as keyof typeof priceIds];
    if (!priceId) {
      throw new Error("Plano inválido");
    }

    // Verificar se já existe um customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Detectar o domínio correto da requisição - usar apenas origin ou referer sem fallback fixo
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/');
    
    if (!origin) {
      throw new Error("Não foi possível determinar o domínio da aplicação");
    }

    console.log("Origin detected:", origin);
    console.log("All headers:", Object.fromEntries(req.headers.entries()));

    // URLs de redirecionamento corretas
    const successUrl = `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/cancelado`;

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_type: planType
      },
      allow_promotion_codes: true,
    });

    console.log("Checkout session created:", session.id);
    console.log("Success URL:", successUrl);
    console.log("Cancel URL:", cancelUrl);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
