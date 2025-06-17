
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreateAgent = () => {
    navigate('/auth');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-green-50 to-white py-12 md:py-20 lg:py-32 px-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full opacity-50 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-200 rounded-full opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-6 md:space-y-8">
          {/* Main headline */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-dark leading-tight animate-fade-in">
              {t('hero.title.part1')} <span className="text-brand-green gradient-text">{t('hero.title.highlight')}</span> {t('hero.title.part2')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-brand-gray max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
              {t('hero.subtitle')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 md:pt-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Button 
              size="lg"
              className="bg-brand-green hover:bg-brand-green/90 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift animate-glow group w-full sm:w-auto"
              onClick={handleCreateAgent}
            >
              {t('hero.cta.primary')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl transition-all duration-300 hover-lift group w-full sm:w-auto"
              onClick={() => scrollToSection('como-funciona')}
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              {t('hero.cta.secondary')}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 md:pt-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <p className="text-sm md:text-base text-brand-gray mb-6">
              {t('hero.trustIndicators.title')}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-green font-bold text-sm">✓</span>
                </div>
                <span className="text-sm md:text-base text-brand-gray">{t('hero.trustIndicators.feature1')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-green font-bold text-sm">✓</span>
                </div>
                <span className="text-sm md:text-base text-brand-gray">{t('hero.trustIndicators.feature2')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-green font-bold text-sm">✓</span>
                </div>
                <span className="text-sm md:text-base text-brand-gray">{t('hero.trustIndicators.feature3')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
