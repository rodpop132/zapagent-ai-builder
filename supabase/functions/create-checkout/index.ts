
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
    const { planType, guestCheckout } = await req.json();
    
    let user = null;
    
    // Se não for checkout de convidado, tentar autenticar usuário
    if (!guestCheckout) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const { data } = await supabaseClient.auth.getUser(token);
          user = data.user;
        } catch (error) {
          console.log("Erro na autenticação, continuando como convidado:", error);
        }
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Definir preços baseado no plano
    const priceIds = {
      pro: "price_1RVbYyPpmCy5gtzzPUjXC12Z", // 10.000 mensagens/mês
      ultra: "price_1RVfjlPpmCy5gtzzfOMaqUJO" // Ilimitado
    };

    const priceId = priceIds[planType as keyof typeof priceIds];
    if (!priceId) {
      throw new Error("Plano inválido");
    }

    let customerId;
    
    // Se for usuário autenticado, verificar customer existente
    if (user?.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Detectar o domínio correto da requisição
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/');
    
    if (!origin) {
      throw new Error("Não foi possível determinar o domínio da aplicação");
    }

    console.log("Origin detected:", origin);

    // URLs de redirecionamento corretas
    const successUrl = `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/cancelado`;

    // Configuração da sessão de checkout
    const sessionConfig: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    };

    // Se tiver customer ID, usar ele
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (user?.email) {
      // Se for usuário autenticado mas sem customer, usar o email
      sessionConfig.customer_email = user.email;
    }
    // Para checkout de convidado, não definir customer nem customer_email
    // O Stripe vai pedir o email durante o checkout

    // Metadados para identificar o usuário se estiver logado
    if (user) {
      sessionConfig.metadata = {
        user_id: user.id,
        user_email: user.email,
        plan_type: planType
      };
    } else {
      // Para checkout de convidado, ainda incluir metadados do plano
      sessionConfig.metadata = {
        plan_type: planType,
        guest_checkout: true
      };
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create(sessionConfig);

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
