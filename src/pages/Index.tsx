
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
import MetaPixel from "@/components/MetaPixel";
import AffiliateTracker from "@/components/AffiliateTracker";
import SocialProofNotifications from "@/components/SocialProofNotifications";

const Index = () => {
  return (
    <div className="min-h-screen">
      <MetaPixel />
      <AffiliateTracker />
      <Header />
      <HeroSection />
      <HowItWorks />
      <Dashboard />
      <Benefits />
      <PricingSection />
      <Testimonials />
      <FAQ />
      <Footer />
      <SupportWidget />
      <SocialProofNotifications />
    </div>
  );
};

export default Index;
