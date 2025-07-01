
import React from 'react';
import { Star, Building2, Users, TrendingUp } from 'lucide-react';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant':
        return <Building2 className="h-5 w-5 text-orange-500" />;
      case 'marketing':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <Building2 className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-green-50/30 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-green-500 mr-4"></div>
            <Users className="h-8 w-8 text-green-600" />
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-green-500 ml-4"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 transition-all duration-700 hover:text-green-600">
            {t('services.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Trust indicator */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-8 py-4 shadow-xl border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-semibold">
                {t('services.trustedBy')} <span className="text-green-600 font-bold">500+</span> {t('services.companies')}
              </span>
            </div>
          </div>
        </div>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {businesses.map((business, index) => (
            <div
              key={business.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category badge */}
                <div className="absolute top-4 left-4 flex items-center bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                  {getCategoryIcon(business.category)}
                  <span className="ml-2 text-sm font-medium text-gray-700">{business.type}</span>
                </div>

                {/* Rating badge */}
                <div className="absolute top-4 right-4 flex items-center bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-bold text-gray-800">{business.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                  {business.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {business.description}
                </p>
                
                {/* Success indicator */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Activo con ZapAgent</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    ⚡ Respuesta instantánea
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Sectors section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('services.sectors')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors duration-300">
                {t('services.restaurant')}
              </span>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors duration-300">
                {t('services.marketing')}
              </span>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors duration-300">
                {t('services.retail')}
              </span>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-green-600 transition-colors duration-300">
                {t('services.services')}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
      </div>
    </section>
  );
};

export default ServicesSection;
