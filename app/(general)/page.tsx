import HomeHero from "../components/homePage/HeroSection";
import FeaturesSection from "../components/homePage/FeaturesSection";
import TechnologySection from "../components/homePage/TechnologySection";
import PricingSection from "../components/homePage/PricingSection";
import TestimonialsSection from "../components/homePage/TestimonialsSection";

export const revalidate = 60;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HomeHero/>
      <FeaturesSection/>
      <TechnologySection/>
      <PricingSection/>
      <TestimonialsSection/>
    </div>
  );
}
