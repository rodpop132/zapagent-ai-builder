
import React from 'react';
import { Star, Building2, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ServicesSection = () => {
  const { t } = useTranslation();

  const businesses = [
    {
      id: 1,
      name: t('services.businesses.bardero.name'),
      type: t('services.businesses.bardero.type'),
      rating: t('services.businesses.bardero.rating'),
      description: t('services.businesses.bardero.description'),
      image: "/lovable-uploads/389b6bf0-ccbd-4264-85cb-54b20944ef42.png",
      category: "restaurant"
    },
    {
      id: 2,
      name: t('services.businesses.viana.name'),
      type: t('services.businesses.viana.type'),
      rating: t('services.businesses.viana.rating'),
      description: t('services.businesses.viana.description'),
      image: "/lovable-uploads/136f1d0d-436f-4b7e-b667-2c9b30691f98.png",
      category: "restaurant"
    },
    {
      id: 3,
      name: t('services.businesses.lamiventa.name'),
      type: t('services.businesses.lamiventa.type'),
      rating: t('services.businesses.lamiventa.rating'),
      description: t('services.businesses.lamiventa.description'),
      image: "/lovable-uploads/d2bc82b1-696f-46a3-857e-f41e906ee97c.png",
      category: "restaurant"
    },
    {
      id: 4,
      name: t('services.businesses.hellomonday.name'),
      type: t('services.businesses.hellomonday.type'),
      rating: t('services.businesses.hellomonday.rating'),
      description: t('services.businesses.hellomonday.description'),
      image: "/lovable-uploads/208b1645-a668-4375-86c8-7eddca30b92e.png",
      category: "marketing"
    },
    {
      id: 5,
      name: t('services.businesses.optimoclick.name'),
      type: t('services.businesses.optimoclick.type'),
      rating: t('services.businesses.optimoclick.rating'),
      description: t('services.businesses.optimoclick.description'),
      image: "/lovable-uploads/0a98eacc-578e-426a-96d7-8a14d59d64ce.png",
      category: "marketing"
    }
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header - More subtle and natural */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Trust indicator - Simplified */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center bg-green-50 rounded-full px-6 py-3 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-gray-700 font-medium">
              {t('services.trustedBy')} <span className="text-green-600 font-bold">500+</span> {t('services.companies')}
            </span>
          </div>
        </div>

        {/* Business showcase - More natural grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {businesses.slice(0, 3).map((business, index) => (
            <div
              key={business.id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center shadow-sm">
                  <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                  <span className="text-xs font-medium text-gray-800">{business.rating}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{business.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{business.type}</p>
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Usando ZapAgent
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional businesses in a different layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {businesses.slice(3).map((business, index) => (
            <div
              key={business.id}
              className="group bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-md transition-all duration-300 border border-gray-100 animate-fade-in"
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={business.image}
                    alt={business.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{business.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{business.type}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      {business.rating}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Simple sectors section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {t('services.sectors')}
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-full">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">{t('services.restaurant')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">{t('services.marketing')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{t('services.retail')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{t('services.services')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
