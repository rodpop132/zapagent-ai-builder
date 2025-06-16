
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Facebook Pixel ID - you may need to update this with your actual Pixel ID
const FACEBOOK_PIXEL_ID = "YOUR_PIXEL_ID"; // Replace with your actual Pixel ID

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventName, eventData, userData } = await req.json();
    
    const facebookAccessToken = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    
    if (!facebookAccessToken) {
      throw new Error("Facebook access token not configured");
    }

    // Hash email if provided (Facebook requires SHA256 hashed emails)
    let hashedEmail = null;
    if (userData?.email) {
      const encoder = new TextEncoder();
      const data = encoder.encode(userData.email.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashedEmail = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Prepare the payload for Facebook Conversions API
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: {
            em: hashedEmail ? [hashedEmail] : undefined,
            client_ip_address: userData?.clientIp || null,
            client_user_agent: userData?.userAgent || null,
          },
          custom_data: eventData || {},
          event_source_url: userData?.sourceUrl || null,
        }
      ]
    };

    console.log('📊 FACEBOOK: Enviando evento:', eventName, payload);

    // Send event to Facebook Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events?access_token=${facebookAccessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ FACEBOOK: Erro na API:', result);
      throw new Error(`Facebook API error: ${JSON.stringify(result)}`);
    }

    console.log('✅ FACEBOOK: Evento enviado com sucesso:', result);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ FACEBOOK: Erro ao enviar evento:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
