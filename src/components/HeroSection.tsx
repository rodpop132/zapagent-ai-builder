
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
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-green-50 via-white to-blue-50 animate-fade-in">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 md:space-y-8 animate-slide-in-left">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-brand-dark leading-tight transition-all duration-700 hover:text-primary">
                  {t('hero.title')}
                </h1>
                <p className="text-lg md:text-xl text-brand-gray leading-relaxed transition-all duration-500 hover:text-brand-dark">
                  {t('hero.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 text-sm md:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={scrollToPlans}
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-6 md:px-8 py-3 text-sm md:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-50"
                  onClick={() => setShowSimulator(true)}
                >
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110" />
                  Simular Conversa
                </Button>
              </div>
            </div>

            <div className="relative animate-slide-in-right">
              <div className="relative z-10 bg-white rounded-2xl shadow-xl p-4 md:p-6 transition-all duration-500 hover:shadow-2xl hover:scale-105">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-green-700 hover:scale-110">
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base transition-colors duration-300 hover:text-primary">ZapAgent</p>
                      <p className="text-green-600 text-xs md:text-sm transition-all duration-300 hover:text-green-700">● Online</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="bg-gray-100 rounded-lg p-3 md:p-4 rounded-bl-none max-w-[80%] transition-all duration-300 hover:bg-gray-200 hover:scale-105 animate-slide-in-left" style={{animationDelay: '0.5s'}}>
                      <p className="text-xs md:text-sm">{t('hero.chatExample.bot1')}</p>
                    </div>
                    
                    <div className="bg-green-600 text-white rounded-lg p-3 md:p-4 rounded-br-none max-w-[80%] ml-auto transition-all duration-300 hover:bg-green-700 hover:scale-105 animate-slide-in-right" style={{animationDelay: '0.7s'}}>
                      <p className="text-xs md:text-sm">{t('hero.chatExample.user1')}</p>
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-3 md:p-4 rounded-bl-none max-w-[80%] transition-all duration-300 hover:bg-gray-200 hover:scale-105 animate-slide-in-left" style={{animationDelay: '0.9s'}}>
                      <p className="text-xs md:text-sm">{t('hero.chatExample.bot2')}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-brand-gray animate-fade-in" style={{animationDelay: '1.1s'}}>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs md:text-sm transition-colors duration-300 hover:text-gray-800">{t('hero.chatExample.typing')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl transform rotate-1 scale-105 opacity-20 transition-all duration-500 hover:opacity-30 hover:rotate-2"></div>
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
