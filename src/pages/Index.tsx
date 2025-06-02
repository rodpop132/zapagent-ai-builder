
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Dashboard from "@/components/Dashboard";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import PricingSection from "@/components/PricingSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorks />
      <Dashboard />
      <Benefits />
      <Testimonials />
      <PricingSection />
      <FAQ />
      <Footer />
      <SupportWidget />
    </div>
  );
};

export default Index;
