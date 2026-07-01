import TopUtilityStrip from "@/components/TopUtilityStrip";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PaperPreview from "@/components/PaperPreview";
import EvidenceEngine from "@/components/EvidenceEngine";
import SocialProof from "@/components/SocialProof";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-paper overflow-x-hidden">
      <TopUtilityStrip />
      <Header />
      <HeroSection />
      <div className="max-w-[1380px] mx-auto px-6">
        <PaperPreview />
      </div>
      <EvidenceEngine />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
