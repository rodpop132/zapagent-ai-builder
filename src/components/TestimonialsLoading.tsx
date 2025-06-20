
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Shield, Users, Award } from 'lucide-react';

const TestimonialsLoading = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Header with animated skeleton */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="animate-pulse">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-[600px] mx-auto" />
        </div>

        {/* Trust indicators */}
        <div className="flex justify-center items-center gap-8 mb-16">
          <div className="flex items-center gap-2 animate-fade-in">
            <Shield className="h-6 w-6 text-green-500" />
            <span className="text-sm text-gray-600">Verificado</span>
          </div>
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Award className="h-6 w-6 text-blue-500" />
            <span className="text-sm text-gray-600">Certificado</span>
          </div>
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-600">5.0/5.0</span>
          </div>
        </div>

        {/* Loading testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 animate-scale-in hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Stars loading */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{ animationDelay: `${(index * 0.1) + (i * 0.05)}s` }}
                  >
                    <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                ))}
              </div>

              {/* Comment skeleton */}
              <div className="space-y-3 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>

              {/* User info skeleton */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="absolute -top-1 -right-1 bg-green-500 h-4 w-4 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading progress indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg">
            <div className="animate-spin">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Carregando avaliações verificadas...
            </span>
          </div>
        </div>

        {/* Floating elements for visual appeal */}
        <div className="absolute top-20 left-20 opacity-20">
          <div className="animate-float">
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <div className="animate-float" style={{ animationDelay: '2s' }}>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-20">
          <div className="animate-float" style={{ animationDelay: '4s' }}>
            <Award className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsLoading;
