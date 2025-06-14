
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Target, Lightbulb, Heart } from 'lucide-react';
import SupportWidget from '@/components/SupportWidget';
import LanguageSelector from '@/components/LanguageSelector';

const Sobre = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('about.backButton')}</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZA</span>
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900">ZapAgent AI</span>
            </div>
          </div>
          
          {/* Language Selector */}
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-brand-dark mb-6">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl text-brand-gray max-w-3xl mx-auto leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Mission, Vision, Values */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">{t('about.mission')}</h3>
              <p className="text-brand-gray text-sm md:text-base">
                {t('about.missionText')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">{t('about.vision')}</h3>
              <p className="text-brand-gray text-sm md:text-base">
                {t('about.visionText')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">{t('about.values')}</h3>
              <p className="text-brand-gray text-sm md:text-base">
                {t('about.valuesText')}
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-xl p-6 md:p-12 shadow-lg mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark text-center mb-8">
              {t('about.story')}
            </h2>
            
            <div className="prose prose-lg max-w-none text-brand-gray space-y-6">
              <p className="text-sm md:text-base leading-relaxed">
                {t('about.storyText1')}
              </p>
              
              <p className="text-sm md:text-base leading-relaxed">
                {t('about.storyText2')}
              </p>
              
              <p className="text-sm md:text-base leading-relaxed">
                {t('about.storyText3')}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-brand-green mb-2">500+</div>
              <div className="text-sm md:text-base text-brand-gray">{t('about.stats.agents')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-brand-green mb-2">10k+</div>
              <div className="text-sm md:text-base text-brand-gray">{t('about.stats.messages')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-brand-green mb-2">98%</div>
              <div className="text-sm md:text-base text-brand-gray">{t('about.stats.satisfaction')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-brand-green mb-2">24/7</div>
              <div className="text-sm md:text-base text-brand-gray">{t('about.stats.support')}</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-6">
              {t('about.ctaTitle')}
            </h2>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-brand-green hover:bg-brand-green/90 text-white px-6 md:px-8 py-3 text-sm md:text-base"
            >
              {t('about.ctaButton')}
            </Button>
          </div>
        </div>
      </main>

      <SupportWidget />
    </div>
  );
};

export default Sobre;
