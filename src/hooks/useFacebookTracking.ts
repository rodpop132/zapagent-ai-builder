
import { supabase } from '@/integrations/supabase/client';

interface FacebookEventData {
  eventName: string;
  eventData?: Record<string, any>;
  userData?: {
    email?: string;
    clientIp?: string;
    userAgent?: string;
    sourceUrl?: string;
  };
}

export const useFacebookTracking = () => {
  const trackEvent = async ({ eventName, eventData, userData }: FacebookEventData) => {
    try {
      console.log('📊 FACEBOOK: Rastreando evento:', eventName);

      // Get user agent and current URL
      const userAgent = navigator.userAgent;
      const sourceUrl = window.location.href;

      const { data, error } = await supabase.functions.invoke('facebook-conversions', {
        body: {
          eventName,
          eventData,
          userData: {
            ...userData,
            userAgent,
            sourceUrl,
          },
        },
      });

      if (error) {
        console.error('❌ FACEBOOK: Erro ao rastrear evento:', error);
        throw error;
      }

      console.log('✅ FACEBOOK: Evento rastreado:', data);
      return data;
    } catch (error) {
      console.error('❌ FACEBOOK: Erro no tracking:', error);
      // Don't throw error to avoid breaking user flow
    }
  };

  const trackPurchase = async (value: number, currency: string = 'USD', userEmail?: string) => {
    await trackEvent({
      eventName: 'Purchase',
      eventData: {
        currency,
        value: value.toString(),
      },
      userData: {
        email: userEmail,
      },
    });
  };

  const trackViewContent = async (contentName?: string, userEmail?: string) => {
    await trackEvent({
      eventName: 'ViewContent',
      eventData: {
        content_name: contentName,
      },
      userData: {
        email: userEmail,
      },
    });
  };

  const trackInitiateCheckout = async (value?: number, currency: string = 'USD', userEmail?: string) => {
    await trackEvent({
      eventName: 'InitiateCheckout',
      eventData: {
        currency,
        value: value?.toString(),
      },
      userData: {
        email: userEmail,
      },
    });
  };

  return {
    trackEvent,
    trackPurchase,
    trackViewContent,
    trackInitiateCheckout,
  };
};
