
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Dashboard from "@/components/Dashboard";
import Benefits from "@/components/Benefits";
import PricingSection from "@/components/PricingSection";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import SupportWidget from "@/components/SupportWidget";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen">
      <Header />
      <div className={`${isMobile ? 'px-2' : ''}`}>
        <HeroSection />
        <HowItWorks />
        <Dashboard />
        <Benefits />
        <PricingSection />
        <Testimonials />
        <FAQ />
      </div>
      <Footer />
      <SupportWidget />
    </div>
  );
};

export default Index;
