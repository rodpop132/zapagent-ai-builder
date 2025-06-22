
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
    const { planType, guestCheckout, country } = await req.json();
    
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

    // URLs atualizadas dos produtos baseado no país/idioma
    const productUrls = {
      brasil: {
        pro: "https://buy.stripe.com/7sY9AV9gVbQP9Zx0aQafS06",
        ultra: "https://buy.stripe.com/5kQ6oJ2SxaMLgnV6zeafS07"
      },
      usa: {
        pro: "https://buy.stripe.com/cNi4gBeBfaML3B99LqafS02",
        ultra: "https://buy.stripe.com/4gM9AVdxb9IHb3B9LqafS03"
      },
      spain: {
        pro: "https://buy.stripe.com/5kQcN71Otf31dbJ4r6afS04",
        ultra: "https://buy.stripe.com/6oU14pct7f312x5aPuafS05"
      }
    };

    // IDs atualizados dos produtos baseado no país/idioma
    const productIds = {
      brasil: {
        pro: "prod_SUZ84Ym66dvLIW",
        ultra: "prod_SUZ8aGCiSLHXzt"
      },
      usa: {
        pro: "prod_SUZ9Eya6vsJB8r", 
        ultra: "prod_SUZAd2vttAy0qC"
      },
      spain: {
        pro: "prod_SUZBJvi0IHu3bG",
        ultra: "prod_SUZCqBdDx8vg5m"
      }
    };

    // Determinar país baseado no parâmetro ou idioma
    let selectedCountry = 'usa'; // Default
    if (country === 'BR' || country === 'brasil') {
      selectedCountry = 'brasil';
    } else if (country === 'ES' || country === 'spain') {
      selectedCountry = 'spain';
    } else if (country === 'US' || country === 'usa') {
      selectedCountry = 'usa';
    }

    // Pegar a URL correta para o plano e país
    const checkoutUrl = productUrls[selectedCountry]?.[planType];
    const productId = productIds[selectedCountry]?.[planType];

    if (!checkoutUrl || !productId) {
      throw new Error(`Plano ${planType} não encontrado para o país ${selectedCountry}`);
    }

    console.log("Redirecionando para Stripe Checkout:", {
      country: selectedCountry,
      plan: planType,
      url: checkoutUrl,
      productId: productId
    });

    // Retornar URL direta do Stripe Checkout
    return new Response(JSON.stringify({ 
      url: checkoutUrl,
      country: selectedCountry,
      plan: planType,
      productId: productId
    }), {
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
