
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ConversationSimulator from "./ConversationSimulator";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSimulator, setShowSimulator] = useState(false);

  const scrollToPlans = () => {
    const element = document.getElementById('planos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-brand-dark leading-tight">
                  {t('hero.title')}
                </h1>
                <p className="text-lg md:text-xl text-brand-gray leading-relaxed">
                  {t('hero.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 text-sm md:text-base"
                  onClick={scrollToPlans}
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-6 md:px-8 py-3 text-sm md:text-base"
                  onClick={() => setShowSimulator(true)}
                >
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Simular Conversa
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-xl p-4 md:p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">ZapAgent</p>
                      <p className="text-green-600 text-xs md:text-sm">● Online</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="bg-gray-100 rounded-lg p-3 md:p-4 rounded-bl-none max-w-[80%]">
                      <p className="text-xs md:text-sm">{t('hero.chatExample.bot1')}</p>
                    </div>
                    
                    <div className="bg-green-600 text-white rounded-lg p-3 md:p-4 rounded-br-none max-w-[80%] ml-auto">
                      <p className="text-xs md:text-sm">{t('hero.chatExample.user1')}</p>
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-3 md:p-4 rounded-bl-none max-w-[80%]">
                      <p className="text-xs md:text-sm">{t('hero.chatExample.bot2')}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-brand-gray">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs md:text-sm">{t('hero.chatExample.typing')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl transform rotate-1 scale-105 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      <ConversationSimulator 
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
      />
    </>
  );
};

export default HeroSection;
