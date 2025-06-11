
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

    // Definir URLs dos produtos baseado no país/idioma
    const productUrls = {
      brasil: {
        pro: "https://buy.stripe.com/test_9B6aEQe2ieGq1XC6Af1RC00",
        ultra: "https://buy.stripe.com/test_14A7sEgaq0PA8m07Ej1RC01"
      },
      usa: {
        pro: "https://buy.stripe.com/test_14A3co6zQdCmgSw6Af1RC02",
        ultra: "https://buy.stripe.com/test_9B6bIU4rI41MgSw2jZ1RC03"
      },
      spain: {
        pro: "https://buy.stripe.com/test_eVq28k9M2dCm59O1fV1RC04",
        ultra: "https://buy.stripe.com/test_dRmeV64rIbue9q47Ej1RC05"
      }
    };

    // Definir IDs dos produtos baseado no país/idioma
    const productIds = {
      brasil: {
        pro: "prod_STmfzkSSMpD35w",
        ultra: "prod_SToyLyjbb8R2Ds"
      },
      usa: {
        pro: "prod_STp0xvRnEZxeDM", 
        ultra: "prod_STp2DD4hfv6qDw"
      },
      spain: {
        pro: "prod_STp3p9V59yRrlv",
        ultra: "prod_STp5by78vNuem9"
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
